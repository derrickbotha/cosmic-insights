"""
Database models for ML Service
"""
import uuid
from django.db import models
from django.contrib.postgres.fields import JSONField


class Document(models.Model):
    """Document metadata stored in PostgreSQL"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=100, db_index=True)  # From Express auth
    project_id = models.CharField(max_length=100, default='default')
    title = models.CharField(max_length=500)
    mongo_id = models.CharField(max_length=100, unique=True, null=True, blank=True)  # Reference to MongoDB document
    qdrant_id = models.CharField(max_length=100, unique=True, null=True, blank=True)  # Reference to Qdrant vector
    document_type = models.CharField(max_length=50, default='journal_entry')  # journal_entry, goal, pattern, etc.
    metadata = models.JSONField(default=dict, blank=True)
    embedding_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending',
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id', 'document_type']),
            models.Index(fields=['embedding_status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.user_id})"


class Embedding(models.Model):
    """Embedding metadata"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='embeddings')
    vector_id = models.CharField(max_length=100, unique=True)  # Qdrant point ID
    model_name = models.CharField(max_length=200)
    dimension = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'embeddings'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Embedding for {self.document.title}"


class Experiment(models.Model):
    """ML experiment tracking"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    project_id = models.CharField(max_length=100)
    experiment_type = models.CharField(
        max_length=50,
        choices=[
            ('embedding', 'Embedding Generation'),
            ('clustering', 'Pattern Clustering'),
            ('classification', 'Text Classification'),
            ('training', 'Model Training'),
        ],
        default='embedding'
    )
    dataset_ref = models.CharField(max_length=500, blank=True)  # MinIO path
    model_ref = models.CharField(max_length=500, blank=True)  # MinIO path to checkpoint
    config = models.JSONField(default=dict)
    metrics = models.JSONField(default=dict)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('running', 'Running'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending',
        db_index=True
    )
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'experiments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.status})"
