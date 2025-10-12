"""
Celery tasks for async ML processing
"""
import logging
from celery import shared_task
from django.utils import timezone
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def generate_embedding(self, document_id: str, text: str):
    """
    Generate embedding vector for text
    
    Args:
        document_id: Document UUID
        text: Text content to embed
    """
    from .models import Document, Embedding
    from .services.embedding_service import EmbeddingService
    
    try:
        # Update status
        doc = Document.objects.get(id=document_id)
        doc.embedding_status = 'processing'
        doc.save()
        
        # Generate embedding
        logger.info(f"Generating embedding for document {document_id}")
        embedding_service = EmbeddingService()
        vector = embedding_service.generate_embedding(text)
        
        logger.info(f"Generated embedding with dimension {len(vector)}")
        return {
            'document_id': document_id,
            'vector': vector,
            'dimension': len(vector)
        }
        
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        doc.embedding_status = 'failed'
        doc.save()
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))


@shared_task(bind=True, max_retries=3)
def index_to_qdrant(self, document_id: str, vector: list, metadata: dict):
    """
    Index embedding vector to Qdrant
    
    Args:
        document_id: Document UUID
        vector: Embedding vector
        metadata: Document metadata
    """
    from .models import Document, Embedding
    from .services.qdrant_service import QdrantService
    from django.conf import settings
    
    try:
        doc = Document.objects.get(id=document_id)
        
        # Upsert to Qdrant
        logger.info(f"Indexing document {document_id} to Qdrant")
        qdrant_service = QdrantService()
        vector_id = qdrant_service.upsert_vector(
            vector=vector,
            metadata={
                'document_id': document_id,
                'user_id': doc.user_id,
                'document_type': doc.document_type,
                **metadata
            },
            point_id=document_id  # Use document ID as point ID
        )
        
        # Create Embedding record
        embedding = Embedding.objects.create(
            document=doc,
            vector_id=vector_id,
            model_name=settings.EMBEDDING_MODEL,
            dimension=len(vector)
        )
        
        # Update document
        doc.qdrant_id = vector_id
        doc.embedding_status = 'completed'
        doc.save()
        
        logger.info(f"Successfully indexed document {document_id}")
        return {'document_id': document_id, 'vector_id': vector_id}
        
    except Exception as e:
        logger.error(f"Error indexing to Qdrant: {e}")
        doc.embedding_status = 'failed'
        doc.save()
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))


@shared_task
def create_embedding_pipeline(document_id: str, text: str):
    """
    Complete pipeline: generate embedding + index to Qdrant
    
    Args:
        document_id: Document UUID
        text: Text content
    """
    from celery import chain
    
    # Chain tasks: generate -> index
    workflow = chain(
        generate_embedding.s(document_id, text),
        index_to_qdrant.s(document_id, metadata={'created_via': 'pipeline'})
    )
    
    result = workflow.apply_async()
    logger.info(f"Started embedding pipeline for document {document_id}: {result.id}")
    return result.id


@shared_task
def sync_journal_entries(user_id: str = None, since: datetime = None):
    """
    Sync journal entries from MongoDB to ML service
    
    Args:
        user_id: Optional user ID to filter
        since: Optional datetime to get entries after
    """
    from .models import Document
    from .services.mongo_service import MongoService
    
    try:
        # Get journal entries from MongoDB
        mongo_service = MongoService()
        
        if since is None:
            # Default: last 24 hours
            since = timezone.now() - timedelta(days=1)
        
        logger.info(f"Syncing journal entries for user {user_id} since {since}")
        entries = mongo_service.get_journal_entries(user_id=user_id, since=since)
        
        logger.info(f"Found {len(entries)} journal entries to sync")
        
        synced_count = 0
        for entry in entries:
            # Check if already exists
            mongo_id = entry['_id']
            exists = Document.objects.filter(mongo_id=mongo_id).exists()
            
            if not exists:
                # Create document
                doc = Document.objects.create(
                    user_id=entry['userId'],
                    title=entry.get('title', 'Journal Entry'),
                    mongo_id=mongo_id,
                    document_type='journal_entry',
                    metadata={
                        'date': entry.get('date'),
                        'mood': entry.get('mood'),
                        'tags': entry.get('tags', [])
                    }
                )
                
                # Queue embedding generation
                text = entry.get('content', '') or entry.get('text', '')
                if text:
                    create_embedding_pipeline.delay(str(doc.id), text)
                    synced_count += 1
        
        logger.info(f"Synced {synced_count} new journal entries")
        return {'synced': synced_count, 'total': len(entries)}
        
    except Exception as e:
        logger.error(f"Error syncing journal entries: {e}")
        raise


@shared_task
def cleanup_old_logs():
    """Clean up old experiment logs and failed documents"""
    from .models import Experiment, Document
    
    try:
        # Delete experiments older than 90 days
        cutoff_date = timezone.now() - timedelta(days=90)
        deleted_experiments = Experiment.objects.filter(
            created_at__lt=cutoff_date,
            status__in=['completed', 'failed']
        ).delete()
        
        # Delete failed documents older than 7 days
        failed_cutoff = timezone.now() - timedelta(days=7)
        deleted_docs = Document.objects.filter(
            created_at__lt=failed_cutoff,
            embedding_status='failed'
        ).delete()
        
        logger.info(f"Cleanup: deleted {deleted_experiments[0]} experiments, {deleted_docs[0]} failed documents")
        return {
            'experiments_deleted': deleted_experiments[0],
            'documents_deleted': deleted_docs[0]
        }
        
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")
        raise


@shared_task
def build_training_dataset(project_id: str, filters: dict):
    """
    Build a training dataset from documents
    
    Args:
        project_id: Project ID
        filters: Query filters for documents
    """
    from .models import Document, Experiment
    from .services.minio_service import MinIOService
    from django.conf import settings
    import json
    
    try:
        # Create experiment
        experiment = Experiment.objects.create(
            name=f"Dataset for {project_id}",
            project_id=project_id,
            experiment_type='embedding',
            status='running',
            config=filters,
            started_at=timezone.now()
        )
        
        # Query documents
        docs = Document.objects.filter(**filters, embedding_status='completed')
        logger.info(f"Building dataset with {docs.count()} documents")
        
        # Build dataset
        dataset = []
        for doc in docs:
            dataset.append({
                'id': str(doc.id),
                'user_id': doc.user_id,
                'title': doc.title,
                'mongo_id': doc.mongo_id,
                'metadata': doc.metadata,
                'created_at': doc.created_at.isoformat()
            })
        
        # Upload to MinIO
        minio_service = MinIOService()
        dataset_json = json.dumps(dataset, indent=2).encode('utf-8')
        object_name = f"{project_id}/dataset_{experiment.id}.json"
        
        minio_service.upload_bytes(
            bucket_name=settings.MINIO_BUCKET_DATASETS,
            object_name=object_name,
            data=dataset_json
        )
        
        # Update experiment
        experiment.dataset_ref = f"{settings.MINIO_BUCKET_DATASETS}/{object_name}"
        experiment.status = 'completed'
        experiment.completed_at = timezone.now()
        experiment.metrics = {'document_count': len(dataset)}
        experiment.save()
        
        logger.info(f"Dataset saved to {experiment.dataset_ref}")
        return {'experiment_id': str(experiment.id), 'document_count': len(dataset)}
        
    except Exception as e:
        logger.error(f"Error building dataset: {e}")
        experiment.status = 'failed'
        experiment.error_message = str(e)
        experiment.completed_at = timezone.now()
        experiment.save()
        raise
