"""
DRF ViewSets and API Views
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import Document, Embedding, Experiment
from .serializers import (
    DocumentSerializer, EmbeddingSerializer, ExperimentSerializer,
    SemanticSearchSerializer, SyncJournalSerializer
)
from .services.embedding_service import EmbeddingService
from .services.qdrant_service import QdrantService
from .tasks import create_embedding_pipeline, sync_journal_entries

logger = logging.getLogger(__name__)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Document CRUD operations
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    
    def get_queryset(self):
        """Filter by user_id if provided"""
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create documents"""
        documents = request.data.get('documents', [])
        
        created = []
        for doc_data in documents:
            serializer = self.get_serializer(data=doc_data)
            if serializer.is_valid():
                doc = serializer.save()
                created.append(doc)
            else:
                logger.warning(f"Invalid document data: {serializer.errors}")
        
        return Response({
            'created': len(created),
            'total': len(documents)
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def reindex(self, request, pk=None):
        """Trigger re-indexing of document"""
        document = self.get_object()
        
        # Get text from MongoDB
        from .services.mongo_service import MongoService
        mongo_service = MongoService()
        
        if document.mongo_id:
            entry = mongo_service.get_journal_entry(document.mongo_id)
            if entry:
                text = entry.get('content', '') or entry.get('text', '')
                if text:
                    # Reset status and queue task
                    document.embedding_status = 'pending'
                    document.save()
                    
                    create_embedding_pipeline.delay(str(document.id), text)
                    
                    return Response({'message': 'Reindexing started'})
        
        return Response(
            {'error': 'No text found for document'},
            status=status.HTTP_400_BAD_REQUEST
        )


class EmbeddingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Embedding (read-only)
    """
    queryset = Embedding.objects.all()
    serializer_class = EmbeddingSerializer
    
    def get_queryset(self):
        """Filter by document user_id"""
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(document__user_id=user_id)
        return queryset


class ExperimentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Experiment tracking
    """
    queryset = Experiment.objects.all()
    serializer_class = ExperimentSerializer
    
    def get_queryset(self):
        """Filter by project_id"""
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset


class SemanticSearchView(APIView):
    """
    Semantic search endpoint
    
    POST /api/v1/search/
    {
        "query": "I'm feeling anxious about my future",
        "user_id": "123",
        "document_type": "journal_entry",
        "top_k": 10,
        "score_threshold": 0.5
    }
    """
    
    def post(self, request):
        serializer = SemanticSearchSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            # Generate query embedding
            embedding_service = EmbeddingService()
            query_vector = embedding_service.generate_embedding(data['query'])
            
            # Search Qdrant
            qdrant_service = QdrantService()
            results = qdrant_service.search_vectors(
                query_vector=query_vector,
                limit=data['top_k'],
                score_threshold=data['score_threshold'],
                filter_dict={
                    'user_id': data['user_id'],
                    'document_type': data['document_type']
                }
            )
            
            # Enrich with document metadata
            enriched_results = []
            for result in results:
                doc_id = result['payload'].get('document_id')
                if doc_id:
                    try:
                        doc = Document.objects.get(id=doc_id)
                        enriched_results.append({
                            'score': result['score'],
                            'document': DocumentSerializer(doc).data,
                            'payload': result['payload']
                        })
                    except Document.DoesNotExist:
                        logger.warning(f"Document {doc_id} not found in PostgreSQL")
                        enriched_results.append(result)
                else:
                    enriched_results.append(result)
            
            return Response({
                'query': data['query'],
                'results': enriched_results,
                'count': len(enriched_results)
            })
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SyncJournalEntriesView(APIView):
    """
    Trigger journal sync from MongoDB
    
    POST /api/v1/sync/
    {
        "user_id": "123",  // optional
        "since": "2024-01-01T00:00:00Z",  // optional
        "force": false  // optional
    }
    """
    
    def post(self, request):
        serializer = SyncJournalSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            # Queue sync task
            task = sync_journal_entries.delay(
                user_id=data.get('user_id'),
                since=data.get('since')
            )
            
            return Response({
                'message': 'Sync started',
                'task_id': task.id
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            logger.error(f"Sync error: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthCheckView(APIView):
    """
    Health check endpoint
    
    GET /api/v1/health/
    """
    
    def get(self, request):
        health_status = {
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'services': {}
        }
        
        # Check database
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            health_status['services']['database'] = 'healthy'
        except Exception as e:
            health_status['services']['database'] = f'unhealthy: {e}'
            health_status['status'] = 'degraded'
        
        # Check Qdrant
        try:
            qdrant_service = QdrantService()
            qdrant_service.get_client().get_collections()
            health_status['services']['qdrant'] = 'healthy'
        except Exception as e:
            health_status['services']['qdrant'] = f'unhealthy: {e}'
            health_status['status'] = 'degraded'
        
        # Check MongoDB
        try:
            from .services.mongo_service import MongoService
            mongo_service = MongoService()
            mongo_service.get_client().server_info()
            health_status['services']['mongodb'] = 'healthy'
        except Exception as e:
            health_status['services']['mongodb'] = f'unhealthy: {e}'
            health_status['status'] = 'degraded'
        
        # Check embedding model
        try:
            embedding_service = EmbeddingService()
            embedding_service.get_model()
            health_status['services']['embedding_model'] = 'healthy'
        except Exception as e:
            health_status['services']['embedding_model'] = f'unhealthy: {e}'
            health_status['status'] = 'degraded'
        
        status_code = status.HTTP_200_OK if health_status['status'] == 'healthy' else status.HTTP_503_SERVICE_UNAVAILABLE
        
        return Response(health_status, status=status_code)
