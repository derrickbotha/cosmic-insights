"""
Service for interacting with MongoDB (existing database)
"""
import logging
from pymongo import MongoClient
from django.conf import settings
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class MongoService:
    """Singleton service for MongoDB operations"""
    
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def get_client(self) -> MongoClient:
        """Get MongoDB client"""
        if self._client is None:
            logger.info(f"Connecting to MongoDB: {settings.MONGO_URI}")
            self._client = MongoClient(settings.MONGO_URI)
            self._db = self._client[settings.MONGO_DB_NAME]
            logger.info(f"Connected to database: {settings.MONGO_DB_NAME}")
        return self._client
    
    def get_db(self):
        """Get database object"""
        if self._db is None:
            self.get_client()
        return self._db
    
    def get_journal_entries(
        self,
        user_id: Optional[str] = None,
        since: Optional[datetime] = None,
        limit: int = 1000
    ) -> List[Dict[str, Any]]:
        """
        Get journal entries from MongoDB
        
        Args:
            user_id: Filter by user ID
            since: Get entries created after this datetime
            limit: Maximum number of entries
            
        Returns:
            List of journal entry documents
        """
        db = self.get_db()
        query = {}
        
        if user_id:
            query['userId'] = user_id
        
        if since:
            query['createdAt'] = {'$gte': since}
        
        entries = list(db.journalentries.find(query).limit(limit))
        
        # Convert ObjectId to string
        for entry in entries:
            entry['_id'] = str(entry['_id'])
        
        return entries
    
    def get_journal_entry(self, entry_id: str) -> Optional[Dict[str, Any]]:
        """Get a single journal entry by ID"""
        from bson import ObjectId
        db = self.get_db()
        
        try:
            entry = db.journalentries.find_one({'_id': ObjectId(entry_id)})
            if entry:
                entry['_id'] = str(entry['_id'])
            return entry
        except Exception as e:
            logger.error(f"Error fetching journal entry {entry_id}: {e}")
            return None
    
    def get_goals(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get user goals"""
        db = self.get_db()
        query = {'userId': user_id} if user_id else {}
        
        goals = list(db.goals.find(query))
        for goal in goals:
            goal['_id'] = str(goal['_id'])
        
        return goals
    
    def get_patterns(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get user patterns"""
        db = self.get_db()
        query = {'userId': user_id} if user_id else {}
        
        patterns = list(db.patterns.find(query))
        for pattern in patterns:
            pattern['_id'] = str(pattern['_id'])
        
        return patterns
    
    def store_raw_text(self, collection_name: str, document: Dict[str, Any]) -> str:
        """Store raw text document"""
        db = self.get_db()
        result = db[collection_name].insert_one(document)
        return str(result.inserted_id)
