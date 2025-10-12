/**
 * ML Service Client
 * HTTP client for communicating with Django ML service
 */
const axios = require('axios');
const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://ml-service:8000';

class MLService {
  constructor() {
    this.client = axios.create({
      baseURL: `${ML_SERVICE_URL}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`ML Service Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('ML Service Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`ML Service Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error(
            `ML Service Error: ${error.response.status} ${error.response.config.url}`,
            error.response.data
          );
        } else {
          logger.error('ML Service Connection Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check ML service health
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/health/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create document and generate embedding
   * @param {string} userId - User ID from Express auth
   * @param {string} title - Document title
   * @param {string} text - Document text content
   * @param {string} documentType - Type: journal_entry, goal, pattern, etc.
   * @param {object} metadata - Additional metadata
   */
  async createDocument(userId, title, text, documentType = 'journal_entry', metadata = {}) {
    try {
      const response = await this.client.post('/documents/', {
        user_id: userId,
        title,
        text,
        document_type: documentType,
        metadata,
      });

      logger.info(`Document created: ${response.data.id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error('Failed to create document:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Generate embedding for existing document
   * @param {string} documentId - Document UUID
   */
  async generateEmbedding(documentId) {
    try {
      const response = await this.client.post(`/documents/${documentId}/embed/`);
      
      logger.info(`Embedding generation triggered for document: ${documentId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error('Failed to generate embedding:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Search for similar documents using semantic search
   * @param {string} userId - User ID to filter results
   * @param {string} query - Search query text
   * @param {number} limit - Maximum number of results
   * @param {string} documentType - Optional filter by document type
   */
  async searchSimilar(userId, query, limit = 10, documentType = null) {
    try {
      const params = {
        user_id: userId,
        query,
        limit,
      };

      if (documentType) {
        params.document_type = documentType;
      }

      const response = await this.client.post('/documents/search/', params);
      
      logger.info(`Found ${response.data.results?.length || 0} similar documents for user: ${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error('Failed to search documents:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Get document by ID
   * @param {string} documentId - Document UUID
   */
  async getDocument(documentId) {
    try {
      const response = await this.client.get(`/documents/${documentId}/`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error('Failed to get document:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * List documents for a user
   * @param {string} userId - User ID
   * @param {object} filters - Optional filters (document_type, embedding_status, page)
   */
  async listDocuments(userId, filters = {}) {
    try {
      const params = {
        user_id: userId,
        ...filters,
      };

      const response = await this.client.get('/documents/', { params });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error('Failed to list documents:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Delete a document
   * @param {string} documentId - Document UUID
   */
  async deleteDocument(documentId) {
    try {
      await this.client.delete(`/documents/${documentId}/`);
      
      logger.info(`Document deleted: ${documentId}`);
      return {
        success: true,
      };
    } catch (error) {
      logger.error('Failed to delete document:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Sync user data from Express MongoDB to ML service
   * @param {string} userId - User ID to sync
   */
  async syncUserData(userId) {
    try {
      const response = await this.client.post('/sync/', {
        user_id: userId,
      });
      
      logger.info(`User data sync triggered for: ${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error('Failed to sync user data:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Get embeddings for a document
   * @param {string} documentId - Document UUID
   */
  async getEmbeddings(documentId) {
    try {
      const response = await this.client.get(`/embeddings/`, {
        params: { document_id: documentId },
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error('Failed to get embeddings:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Get pattern insights for user
   * Analyzes user's documents to find patterns and themes
   * @param {string} userId - User ID
   * @param {number} minClusterSize - Minimum cluster size for patterns
   */
  async getPatternInsights(userId, minClusterSize = 3) {
    try {
      const response = await this.client.post('/patterns/analyze/', {
        user_id: userId,
        min_cluster_size: minClusterSize,
      });
      
      logger.info(`Pattern analysis complete for user: ${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      // Pattern analysis might not be implemented yet
      logger.warn('Pattern analysis not available:', error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }
}

// Export singleton instance
module.exports = new MLService();
