"""
DRF Serializers for API
"""
from rest_framework import serializers
from .models import Document, Embedding, Experiment


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model"""
    
    text = serializers.CharField(write_only=True, required=False)  # For creating with text
    
    class Meta:
        model = Document
        fields = [
            'id', 'user_id', 'project_id', 'title', 'mongo_id', 'qdrant_id',
            'document_type', 'metadata', 'embedding_status', 'created_at',
            'updated_at', 'text'
        ]
        read_only_fields = ['id', 'qdrant_id', 'embedding_status', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create document and trigger embedding generation"""
        text = validated_data.pop('text', None)
        document = super().create(validated_data)
        
        if text:
            # Queue Celery task to generate embedding
            from .tasks import create_embedding_pipeline
            create_embedding_pipeline.delay(str(document.id), text)
        
        return document


class EmbeddingSerializer(serializers.ModelSerializer):
    """Serializer for Embedding model"""
    
    document_title = serializers.CharField(source='document.title', read_only=True)
    
    class Meta:
        model = Embedding
        fields = ['id', 'document', 'document_title', 'vector_id', 'model_name', 'dimension', 'created_at']
        read_only_fields = ['id', 'vector_id', 'created_at']


class ExperimentSerializer(serializers.ModelSerializer):
    """Serializer for Experiment model"""
    
    class Meta:
        model = Experiment
        fields = [
            'id', 'name', 'project_id', 'experiment_type', 'dataset_ref',
            'model_ref', 'config', 'metrics', 'status', 'error_message',
            'started_at', 'completed_at', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'metrics', 'started_at', 'completed_at', 'created_at']


class SemanticSearchSerializer(serializers.Serializer):
    """Input for semantic search"""
    
    query = serializers.CharField(required=True, max_length=1000)
    user_id = serializers.CharField(required=True, max_length=100)
    document_type = serializers.CharField(required=False, default='journal_entry')
    top_k = serializers.IntegerField(required=False, default=10, min_value=1, max_value=100)
    score_threshold = serializers.FloatField(required=False, default=0.5, min_value=0.0, max_value=1.0)


class SyncJournalSerializer(serializers.Serializer):
    """Input for syncing journal entries"""
    
    user_id = serializers.CharField(required=False, allow_blank=True)
    since = serializers.DateTimeField(required=False)
    force = serializers.BooleanField(required=False, default=False)
