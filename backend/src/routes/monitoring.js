const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { protect, authorize } = require('../middleware/auth');

// Public endpoint for storing logs (rate-limited but no auth required)
router.post('/logs', monitoringController.storeLogs);

// Protected endpoints for viewing logs (admin only)
router.get('/logs', protect, authorize('admin'), monitoringController.getLogs);
router.get('/health/component', protect, authorize('admin'), monitoringController.getComponentHealth);
router.get('/health/application', protect, authorize('admin'), monitoringController.getApplicationHealth);
router.get('/analytics/errors', protect, authorize('admin'), monitoringController.getErrorAnalytics);
router.get('/analytics/performance', protect, authorize('admin'), monitoringController.getPerformanceMetrics);
router.get('/journey/:sessionId', protect, authorize('admin'), monitoringController.getUserJourney);
router.delete('/cleanup', protect, authorize('admin'), monitoringController.cleanupLogs);

module.exports = router;
