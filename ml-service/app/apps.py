"""
App configuration
"""
from django.apps import AppConfig


class AppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app'
    
    def ready(self):
        """Initialize app resources on startup"""
        from .services.embedding_service import EmbeddingService
        from .services.qdrant_service import QdrantService
        from .services.minio_service import MinIOService
        
        # Initialize services (creates collections, buckets, etc.)
        try:
            QdrantService().initialize_collection()
            MinIOService().initialize_buckets()
            EmbeddingService().load_model()
        except Exception as e:
            print(f"Warning: Failed to initialize services: {e}")
