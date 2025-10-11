const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  analyticsEventValidation,
  paginationValidation,
  dateRangeValidation,
  mongoIdValidation
} = require('../middleware/validation');

/**
 * @route   POST /api/analytics/event
 * @desc    Track a single analytics event
 * @access  Public (optionalAuth - works with or without authentication)
 */
router.post('/event', optionalAuth, analyticsEventValidation, analyticsController.trackEvent);

/**
 * @route   POST /api/analytics/events/batch
 * @desc    Track multiple analytics events in a batch
 * @access  Public (optionalAuth)
 */
router.post('/events/batch', optionalAuth, analyticsController.trackEventsBatch);

/**
 * @route   GET /api/analytics/summary
 * @desc    Get analytics summary with aggregated data
 * @access  Private
 */
router.get('/summary', authenticate, dateRangeValidation, analyticsController.getAnalyticsSummary);

/**
 * @route   GET /api/analytics/journey/:userId
 * @desc    Get user journey (event timeline)
 * @access  Private (Admin or own data)
 */
router.get('/journey/:userId', authenticate, mongoIdValidation('userId'), analyticsController.getUserJourney);

/**
 * @route   GET /api/analytics/realtime
 * @desc    Get real-time events
 * @access  Private (Admin only)
 */
router.get('/realtime', authenticate, authorize('admin'), analyticsController.getRealtimeEvents);

/**
 * @route   GET /api/analytics/events
 * @desc    Get paginated list of analytics events
 * @access  Private
 */
router.get('/events', authenticate, paginationValidation, dateRangeValidation, analyticsController.getEvents);

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data (JSON or CSV)
 * @access  Private (Admin only)
 */
router.get('/export', authenticate, authorize('admin'), dateRangeValidation, analyticsController.exportAnalytics);

/**
 * @route   DELETE /api/analytics/cleanup
 * @desc    Delete old analytics events
 * @access  Private (Admin only)
 */
router.delete('/cleanup', authenticate, authorize('admin'), analyticsController.cleanupOldEvents);

module.exports = router;
