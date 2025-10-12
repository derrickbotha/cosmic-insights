"""
Admin configuration for Django admin panel
"""
from django.contrib import admin
from .models import Document, Embedding, Experiment


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'user_id', 'document_type', 'embedding_status', 'created_at']
    list_filter = ['document_type', 'embedding_status', 'created_at']
    search_fields = ['title', 'user_id', 'mongo_id']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Embedding)
class EmbeddingAdmin(admin.ModelAdmin):
    list_display = ['document', 'model_name', 'dimension', 'created_at']
    list_filter = ['model_name', 'created_at']
    search_fields = ['document__title', 'vector_id']
    readonly_fields = ['id', 'created_at']


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = ['name', 'experiment_type', 'status', 'started_at', 'completed_at']
    list_filter = ['experiment_type', 'status', 'created_at']
    search_fields = ['name', 'project_id']
    readonly_fields = ['id', 'created_at', 'started_at', 'completed_at']
