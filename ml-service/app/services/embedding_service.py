"""
Service for generating embeddings using SentenceTransformers
"""
import logging
from typing import List
from sentence_transformers import SentenceTransformer
from django.conf import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Singleton service for embedding generation"""
    
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def load_model(self):
        """Load embedding model (called on app startup)"""
        if self._model is None:
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
            logger.info("Model loaded successfully")
        return self._model
    
    def get_model(self):
        """Get loaded model"""
        if self._model is None:
            self.load_model()
        return self._model
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for text
        
        Args:
            text: Input text
            
        Returns:
            List of floats representing the embedding vector
        """
        model = self.get_model()
        
        # Truncate if too long
        if len(text) > settings.MAX_SEQUENCE_LENGTH * 4:  # Approx 4 chars per token
            text = text[:settings.MAX_SEQUENCE_LENGTH * 4]
        
        # Generate embedding
        embedding = model.encode(text, convert_to_numpy=True)
        
        return embedding.tolist()
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts (more efficient)
        
        Args:
            texts: List of input texts
            
        Returns:
            List of embedding vectors
        """
        model = self.get_model()
        
        # Truncate texts
        texts = [t[:settings.MAX_SEQUENCE_LENGTH * 4] if len(t) > settings.MAX_SEQUENCE_LENGTH * 4 else t for t in texts]
        
        # Generate embeddings
        embeddings = model.encode(texts, convert_to_numpy=True, batch_size=32)
        
        return [emb.tolist() for emb in embeddings]
    
    def get_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate cosine similarity between two texts
        
        Args:
            text1: First text
            text2: Second text
            
        Returns:
            Similarity score between 0 and 1
        """
        model = self.get_model()
        embeddings = model.encode([text1, text2], convert_to_numpy=True)
        
        # Cosine similarity
        from numpy import dot
        from numpy.linalg import norm
        
        similarity = dot(embeddings[0], embeddings[1]) / (norm(embeddings[0]) * norm(embeddings[1]))
        return float(similarity)
