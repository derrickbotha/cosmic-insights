"""
Service for Qdrant vector database operations
"""
import logging
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from django.conf import settings
import uuid

logger = logging.getLogger(__name__)


class QdrantService:
    """Singleton service for Qdrant operations"""
    
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def get_client(self) -> QdrantClient:
        """Get Qdrant client"""
        if self._client is None:
            logger.info(f"Connecting to Qdrant: {settings.QDRANT_URL}")
            self._client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None
            )
            logger.info("Connected to Qdrant")
        return self._client
    
    def initialize_collection(self):
        """Create collection if it doesn't exist"""
        client = self.get_client()
        collection_name = settings.QDRANT_COLLECTION_EMBEDDINGS
        
        # Check if collection exists
        collections = client.get_collections().collections
        exists = any(c.name == collection_name for c in collections)
        
        if not exists:
            logger.info(f"Creating Qdrant collection: {collection_name}")
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=settings.EMBEDDING_DIMENSION,
                    distance=Distance.COSINE
                )
            )
            logger.info("Collection created successfully")
        else:
            logger.info(f"Collection {collection_name} already exists")
    
    def upsert_vector(
        self,
        vector: List[float],
        metadata: Dict[str, Any],
        point_id: Optional[str] = None
    ) -> str:
        """
        Upsert a vector to Qdrant
        
        Args:
            vector: Embedding vector
            metadata: Metadata to store with vector
            point_id: Optional custom point ID
            
        Returns:
            Point ID
        """
        client = self.get_client()
        
        if point_id is None:
            point_id = str(uuid.uuid4())
        
        point = PointStruct(
            id=point_id,
            vector=vector,
            payload=metadata
        )
        
        client.upsert(
            collection_name=settings.QDRANT_COLLECTION_EMBEDDINGS,
            points=[point]
        )
        
        return point_id
    
    def search_vectors(
        self,
        query_vector: List[float],
        limit: int = 10,
        score_threshold: float = 0.5,
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar vectors
        
        Args:
            query_vector: Query embedding vector
            limit: Number of results to return
            score_threshold: Minimum similarity score
            filter_dict: Optional metadata filters (e.g., {"user_id": "123"})
            
        Returns:
            List of search results with score and payload
        """
        client = self.get_client()
        
        # Build filter
        query_filter = None
        if filter_dict:
            conditions = [
                FieldCondition(key=key, match=MatchValue(value=value))
                for key, value in filter_dict.items()
            ]
            query_filter = Filter(must=conditions)
        
        # Search
        results = client.search(
            collection_name=settings.QDRANT_COLLECTION_EMBEDDINGS,
            query_vector=query_vector,
            limit=limit,
            score_threshold=score_threshold,
            query_filter=query_filter
        )
        
        # Format results
        return [
            {
                'id': result.id,
                'score': result.score,
                'payload': result.payload
            }
            for result in results
        ]
    
    def delete_vector(self, point_id: str):
        """Delete a vector by ID"""
        client = self.get_client()
        client.delete(
            collection_name=settings.QDRANT_COLLECTION_EMBEDDINGS,
            points_selector=[point_id]
        )
    
    def get_vector(self, point_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a vector by ID"""
        client = self.get_client()
        points = client.retrieve(
            collection_name=settings.QDRANT_COLLECTION_EMBEDDINGS,
            ids=[point_id]
        )
        
        if points:
            point = points[0]
            return {
                'id': point.id,
                'vector': point.vector,
                'payload': point.payload
            }
        return None
