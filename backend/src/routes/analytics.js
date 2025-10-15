const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { analyticsRateLimitConfig } = require('../config/security');
const {
  analyticsEventValidation,
  paginationValidation,
  dateRangeValidation,
  mongoIdValidation
} = require('../middleware/validation');

// Apply rate limiting to prevent DDoS on analytics endpoints
const analyticsLimiter = rateLimit(analyticsRateLimitConfig);

/**
 * @route   POST /api/analytics/event
 * @desc    Track a single analytics event
 * @access  Public (optionalAuth - works with or without authentication)
 */
router.post('/event', analyticsLimiter, optionalAuth, analyticsEventValidation, analyticsController.trackEvent);

/**
 * @route   POST /api/analytics/events/batch
 * @desc    Track multiple analytics events in a batch
 * @access  Public (optionalAuth)
 */
router.post('/events/batch', analyticsLimiter, optionalAuth, analyticsController.trackEventsBatch);

/**
 * @route   GET /api/analytics/summary
 * @desc    Get analytics summary with aggregated data
 * @access  Private
 */
router.get('/summary', analyticsLimiter, authenticate, dateRangeValidation, analyticsController.getAnalyticsSummary);

/**
 * @route   GET /api/analytics/journey/:userId
 * @desc    Get user journey (event timeline)
 * @access  Private (Admin or own data)
 */
router.get('/journey/:userId', analyticsLimiter, authenticate, mongoIdValidation('userId'), analyticsController.getUserJourney);

/**
 * @route   GET /api/analytics/realtime
 * @desc    Get real-time events
 * @access  Private (Admin only)
 */
router.get('/realtime', analyticsLimiter, authenticate, authorize('admin'), analyticsController.getRealtimeEvents);

/**
 * @route   GET /api/analytics/events
 * @desc    Get paginated list of analytics events
 * @access  Private
 */
router.get('/events', analyticsLimiter, authenticate, paginationValidation, dateRangeValidation, analyticsController.getEvents);

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data (JSON or CSV)
 * @access  Private (Admin only)
 */
router.get('/export', analyticsLimiter, authenticate, authorize('admin'), dateRangeValidation, analyticsController.exportAnalytics);

/**
 * @route   DELETE /api/analytics/cleanup
 * @desc    Delete old analytics events
 * @access  Private (Admin only)
 */
router.delete('/cleanup', analyticsLimiter, authenticate, authorize('admin'), analyticsController.cleanupOldEvents);

module.exports = router;
