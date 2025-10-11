const { v4: uuidv4 } = require('uuid');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const logger = require('../utils/logger');

/**
 * Track a single analytics event
 * @route POST /api/analytics/event
 * @access Public (optionalAuth)
 */
exports.trackEvent = async (req, res) => {
  try {
    const {
      eventName,
      sessionId,
      url,
      pathname,
      referrer,
      deviceType,
      browser,
      os,
      screenResolution,
      viewportSize,
      language,
      eventData,
      performanceMetrics,
      error,
      conversion,
      experimentId,
      variantId
    } = req.body;

    const event = await AnalyticsEvent.create({
      eventId: uuidv4(),
      eventName,
      userId: req.user?.userId,
      sessionId,
      url,
      pathname,
      referrer,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      deviceType,
      browser,
      os,
      screenResolution,
      viewportSize,
      language,
      eventData,
      performanceMetrics,
      error,
      conversion,
      experimentId,
      variantId,
      processed: false
    });

    logger.logAnalytics('event_tracked', req.user?.userId, {
      eventName,
      eventId: event.eventId,
      sessionId
    });

    res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
      data: {
        eventId: event.eventId
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
};

/**
 * Track multiple analytics events (batch)
 * @route POST /api/analytics/events/batch
 * @access Public (optionalAuth)
 */
exports.trackEventsBatch = async (req, res) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Events array is required'
      });
    }

    if (events.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 events per batch'
      });
    }

    const enrichedEvents = events.map(event => ({
      ...event,
      eventId: uuidv4(),
      userId: req.user?.userId,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      processed: false
    }));

    const result = await AnalyticsEvent.insertMany(enrichedEvents);

    logger.logAnalytics('batch_events_tracked', req.user?.userId, {
      count: result.length
    });

    res.status(201).json({
      success: true,
      message: `${result.length} events tracked successfully`,
      data: {
        count: result.length
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to track events'
    });
  }
};

/**
 * Get analytics summary
 * @route GET /api/analytics/summary
 * @access Private (Admin or own data)
 */
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // If not admin, can only view own data
    const targetUserId = req.user.role === 'admin' ? userId : req.user.userId;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const summary = await AnalyticsEvent.getAnalyticsSummary(start, end, targetUserId);

    logger.logAnalytics('summary_viewed', req.user.userId, {
      startDate: start,
      endDate: end,
      targetUserId
    });

    res.json({
      success: true,
      data: {
        dateRange: { startDate: start, endDate: end },
        ...summary
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics summary'
    });
  }
};

/**
 * Get user journey
 * @route GET /api/analytics/journey/:userId
 * @access Private (Admin or own data)
 */
exports.getUserJourney = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId, limit } = req.query;

    // If not admin, can only view own data
    if (req.user.role !== 'admin' && userId !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own journey'
      });
    }

    const journey = await AnalyticsEvent.getUserJourney(
      userId,
      sessionId,
      limit ? parseInt(limit) : 100
    );

    res.json({
      success: true,
      data: {
        userId,
        sessionId,
        events: journey
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user journey'
    });
  }
};

/**
 * Get real-time events
 * @route GET /api/analytics/realtime
 * @access Private (Admin only)
 */
exports.getRealtimeEvents = async (req, res) => {
  try {
    const { limit } = req.query;

    const events = await AnalyticsEvent.getRealtimeEvents(
      limit ? parseInt(limit) : 50
    );

    res.json({
      success: true,
      data: {
        events,
        count: events.length
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time events'
    });
  }
};

/**
 * Get events with pagination
 * @route GET /api/analytics/events
 * @access Private (Admin or own data)
 */
exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, eventName, startDate, endDate } = req.query;
    
    const query = {};

    // If not admin, filter to own events
    if (req.user.role !== 'admin') {
      query.userId = req.user.userId;
    }

    if (eventName) {
      query.eventName = eventName;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      AnalyticsEvent.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'name email'),
      AnalyticsEvent.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
};

/**
 * Export analytics data
 * @route GET /api/analytics/export
 * @access Private (Admin only)
 */
exports.exportAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const events = await AnalyticsEvent.find({
      timestamp: { $gte: start, $lte: end }
    })
      .sort({ timestamp: -1 })
      .populate('userId', 'name email')
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const headers = [
        'Event ID',
        'Event Name',
        'User Email',
        'Session ID',
        'Timestamp',
        'URL',
        'Device Type',
        'Browser',
        'OS'
      ].join(',');

      const rows = events.map(event => [
        event.eventId,
        event.eventName,
        event.userId?.email || 'Anonymous',
        event.sessionId,
        event.timestamp.toISOString(),
        event.url,
        event.deviceType,
        event.browser,
        event.os
      ].join(','));

      const csv = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.csv`);
      return res.send(csv);
    }

    // JSON format
    res.json({
      success: true,
      data: {
        dateRange: { startDate: start, endDate: end },
        events,
        count: events.length
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics'
    });
  }
};

/**
 * Delete old analytics events
 * @route DELETE /api/analytics/cleanup
 * @access Private (Admin only)
 */
exports.cleanupOldEvents = async (req, res) => {
  try {
    const { daysOld = 90 } = req.query;

    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const result = await AnalyticsEvent.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    logger.info(`Deleted ${result.deletedCount} old analytics events`, {
      daysOld,
      cutoffDate,
      deletedBy: req.user.userId
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} events older than ${daysOld} days`,
      data: {
        deletedCount: result.deletedCount,
        cutoffDate
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup old events'
    });
  }
};
