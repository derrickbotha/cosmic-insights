/**
 * ML Service Routes
 * Proxy endpoints for Django ML service
 */
const express = require('express');
const router = express.Router();
const mlService = require('../services/mlService');
const { authenticate, requireMLAdmin } = require('../middleware/auth');
const dataSyncController = require('../controllers/dataSyncController');

/**
 * @route   GET /api/ml/health
 * @desc    Check ML service health
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const result = await mlService.checkHealth();
    
    if (result.success) {
      res.json({
        status: 'healthy',
        mlService: result.data,
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/ml/documents
 * @desc    Create document and generate embedding
 * @access  Private
 */
router.post('/documents', authenticate, async (req, res) => {
  try {
    const { title, text, documentType, metadata } = req.body;

    if (!title || !text) {
      return res.status(400).json({
        success: false,
        error: 'Title and text are required',
      });
    }

    const result = await mlService.createDocument(
      req.user.id,
      title,
      text,
      documentType || 'journal_entry',
      metadata || {}
    );

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/ml/documents
 * @desc    List user's documents
 * @access  Private
 */
router.get('/documents', authenticate, async (req, res) => {
  try {
    const { documentType, embeddingStatus, page } = req.query;

    const filters = {};
    if (documentType) filters.document_type = documentType;
    if (embeddingStatus) filters.embedding_status = embeddingStatus;
    if (page) filters.page = page;

    const result = await mlService.listDocuments(req.user.id, filters);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/ml/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get('/documents/:id', authenticate, async (req, res) => {
  try {
    const result = await mlService.getDocument(req.params.id);

    if (result.success) {
      // Verify user owns this document
      if (result.data.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/ml/documents/:id
 * @desc    Delete document
 * @access  Private
 */
router.delete('/documents/:id', authenticate, async (req, res) => {
  try {
    // First check ownership
    const docResult = await mlService.getDocument(req.params.id);
    
    if (!docResult.success) {
      return res.status(404).json(docResult);
    }

    if (docResult.data.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const result = await mlService.deleteDocument(req.params.id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/ml/documents/:id/embed
 * @desc    Generate embedding for document
 * @access  Private
 */
router.post('/documents/:id/embed', authenticate, async (req, res) => {
  try {
    // First check ownership
    const docResult = await mlService.getDocument(req.params.id);
    
    if (!docResult.success) {
      return res.status(404).json(docResult);
    }

    if (docResult.data.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const result = await mlService.generateEmbedding(req.params.id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/ml/search
 * @desc    Semantic search for similar documents
 * @access  Private
 */
router.post('/search', authenticate, async (req, res) => {
  try {
    const { query, limit, documentType } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query text is required',
      });
    }

    const result = await mlService.searchSimilar(
      req.user.id,
      query,
      limit || 10,
      documentType
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/ml/sync
 * @desc    Sync user data from MongoDB to ML service
 * @access  Private
 */
router.post('/sync', authenticate, async (req, res) => {
  try {
    const result = await mlService.syncUserData(req.user.id);

    if (result.success) {
      res.json({
        success: true,
        message: 'User data sync initiated',
        data: result.data,
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/ml/embeddings/:documentId
 * @desc    Get embeddings for a document
 * @access  Private
 */
router.get('/embeddings/:documentId', authenticate, async (req, res) => {
  try {
    const result = await mlService.getEmbeddings(req.params.documentId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/ml/patterns
 * @desc    Get pattern insights from user's documents
 * @access  Private
 */
router.post('/patterns', authenticate, async (req, res) => {
  try {
    const { minClusterSize } = req.body;

    const result = await mlService.getPatternInsights(
      req.user.id,
      minClusterSize || 3
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/ml/sync/journal
 * @desc    Sync journal entries to ML service
 * @access  Private
 */
router.post('/sync/journal/:userId?', authenticate, dataSyncController.syncJournalEntries);

/**
 * @route   POST /api/ml/sync/goals
 * @desc    Sync goals to ML service
 * @access  Private
 */
router.post('/sync/goals/:userId?', authenticate, dataSyncController.syncGoals);

/**
 * @route   POST /api/ml/sync/all
 * @desc    Sync all user data to ML service
 * @access  Private
 */
router.post('/sync/all/:userId?', authenticate, dataSyncController.syncAllUserData);

/**
 * @route   GET /api/ml/sync/status/:userId?
 * @desc    Get sync status for user
 * @access  Private
 */
router.get('/sync/status/:userId?', authenticate, dataSyncController.getSyncStatus);

/**
 * @route   GET /api/ml/sync/jobs
 * @desc    Get all sync jobs for current user
 * @access  Private
 */
router.get('/sync/jobs', authenticate, dataSyncController.getUserSyncJobs);

/**
 * @route   GET /api/ml/sync/job/:jobId
 * @desc    Get specific sync job status
 * @access  Private
 */
router.get('/sync/job/:jobId', authenticate, dataSyncController.getSyncJobStatus);

module.exports = router;
