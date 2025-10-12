"""
Service for MinIO S3-compatible object storage
"""
import logging
from minio import Minio
from django.conf import settings
from io import BytesIO

logger = logging.getLogger(__name__)


class MinIOService:
    """Singleton service for MinIO operations"""
    
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def get_client(self) -> Minio:
        """Get MinIO client"""
        if self._client is None:
            logger.info(f"Connecting to MinIO: {settings.MINIO_ENDPOINT}")
            self._client = Minio(
                settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_USE_SSL
            )
            logger.info("Connected to MinIO")
        return self._client
    
    def initialize_buckets(self):
        """Create buckets if they don't exist"""
        client = self.get_client()
        buckets = [
            settings.MINIO_BUCKET_DATASETS,
            settings.MINIO_BUCKET_CHECKPOINTS,
            settings.MINIO_BUCKET_UPLOADS
        ]
        
        for bucket_name in buckets:
            if not client.bucket_exists(bucket_name):
                logger.info(f"Creating bucket: {bucket_name}")
                client.make_bucket(bucket_name)
            else:
                logger.info(f"Bucket {bucket_name} already exists")
    
    def upload_file(self, bucket_name: str, object_name: str, file_path: str):
        """Upload a file from disk"""
        client = self.get_client()
        client.fput_object(bucket_name, object_name, file_path)
        logger.info(f"Uploaded {file_path} to {bucket_name}/{object_name}")
    
    def upload_bytes(self, bucket_name: str, object_name: str, data: bytes):
        """Upload bytes data"""
        client = self.get_client()
        data_stream = BytesIO(data)
        client.put_object(
            bucket_name,
            object_name,
            data_stream,
            length=len(data)
        )
        logger.info(f"Uploaded {len(data)} bytes to {bucket_name}/{object_name}")
    
    def download_file(self, bucket_name: str, object_name: str, file_path: str):
        """Download a file to disk"""
        client = self.get_client()
        client.fget_object(bucket_name, object_name, file_path)
        logger.info(f"Downloaded {bucket_name}/{object_name} to {file_path}")
    
    def download_bytes(self, bucket_name: str, object_name: str) -> bytes:
        """Download file as bytes"""
        client = self.get_client()
        response = client.get_object(bucket_name, object_name)
        data = response.read()
        response.close()
        response.release_conn()
        return data
    
    def delete_file(self, bucket_name: str, object_name: str):
        """Delete a file"""
        client = self.get_client()
        client.remove_object(bucket_name, object_name)
        logger.info(f"Deleted {bucket_name}/{object_name}")
    
    def list_files(self, bucket_name: str, prefix: str = ''):
        """List files in bucket"""
        client = self.get_client()
        objects = client.list_objects(bucket_name, prefix=prefix, recursive=True)
        return [obj.object_name for obj in objects]
    
    def get_presigned_url(self, bucket_name: str, object_name: str, expires_seconds: int = 3600) -> str:
        """Get a presigned URL for temporary access"""
        client = self.get_client()
        from datetime import timedelta
        url = client.presigned_get_object(bucket_name, object_name, expires=timedelta(seconds=expires_seconds))
        return url
