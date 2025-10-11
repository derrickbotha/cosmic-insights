const MonitoringLog = require('../models/MonitoringLog');
const logger = require('../utils/logger');

/**
 * Store monitoring logs from frontend
 */
exports.storeLogs = async (req, res) => {
  try {
    const { sessionId, logs } = req.body;

    if (!sessionId || !Array.isArray(logs)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: sessionId and logs array required',
      });
    }

    // Add userId if user is authenticated
    const userId = req.user?._id;

    // Prepare logs for insertion
    const logsToInsert = logs.map(log => ({
      ...log,
      logId: log.id,
      timestamp: new Date(log.timestamp),
      userId,
    }));

    // Bulk insert logs
    await MonitoringLog.insertMany(logsToInsert, { ordered: false });

    // Check for critical errors and log them
    const criticalErrors = logs.filter(log => log.level === 'error' && log.validation?.status === 'error');
    if (criticalErrors.length > 0) {
      logger.warn(`${criticalErrors.length} critical errors detected in session ${sessionId}`);
      criticalErrors.forEach(err => {
        logger.error(`Critical error in ${err.component}: ${err.message}`, { error: err });
      });
    }

    res.status(201).json({
      success: true,
      message: `Stored ${logsToInsert.length} logs`,
      sessionId,
    });
  } catch (error) {
    logger.error('Error storing monitoring logs:', error);
    
    // Don't fail if some logs are duplicates
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Logs processed (some duplicates skipped)',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to store logs',
      error: error.message,
    });
  }
};

/**
 * Get logs with filtering and pagination
 */
exports.getLogs = async (req, res) => {
  try {
    const {
      sessionId,
      component,
      level,
      category,
      startDate,
      endDate,
      validationStatus,
      page = 1,
      limit = 100,
    } = req.query;

    // Build query
    const query = {};

    if (sessionId) query.sessionId = sessionId;
    if (component) query.component = component;
    if (level) query.level = level;
    if (category) query.category = category;
    if (validationStatus) query['validation.status'] = validationStatus;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      MonitoringLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      MonitoringLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message,
    });
  }
};

/**
 * Get component health report
 */
exports.getComponentHealth = async (req, res) => {
  try {
    const { component, startDate, endDate } = req.query;

    const query = {};
    if (component) query.component = component;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Aggregate health data
    const healthData = await MonitoringLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$component',
          totalEvents: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] },
          },
          warnings: {
            $sum: { $cond: [{ $eq: ['$level', 'warn'] }, 1, 0] },
          },
          validationFailures: {
            $sum: { $cond: [{ $eq: ['$validation.status', 'error'] }, 1, 0] },
          },
          avgDuration: { $avg: '$duration' },
          lastSeen: { $max: '$timestamp' },
        },
      },
      {
        $project: {
          component: '$_id',
          totalEvents: 1,
          errors: 1,
          warnings: 1,
          validationFailures: 1,
          avgDuration: { $round: ['$avgDuration', 2] },
          lastSeen: 1,
          healthScore: {
            $max: [
              0,
              {
                $subtract: [
                  100,
                  {
                    $add: [
                      { $multiply: ['$errors', 10] },
                      { $multiply: ['$warnings', 3] },
                      { $multiply: ['$validationFailures', 5] },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      { $sort: { healthScore: 1 } },
    ]);

    res.json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    logger.error('Error fetching component health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch component health',
      error: error.message,
    });
  }
};

/**
 * Get application health overview
 */
exports.getApplicationHealth = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Get overall statistics
    const [stats, componentHealth, recentErrors] = await Promise.all([
      MonitoringLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            errors: {
              $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] },
            },
            warnings: {
              $sum: { $cond: [{ $eq: ['$level', 'warn'] }, 1, 0] },
            },
            validationFailures: {
              $sum: { $cond: [{ $eq: ['$validation.status', 'error'] }, 1, 0] },
            },
            avgResponseTime: { $avg: '$duration' },
          },
        },
      ]),
      MonitoringLog.distinct('component', query),
      MonitoringLog.find({ ...query, level: 'error' })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),
    ]);

    const overallStats = stats[0] || {
      totalEvents: 0,
      errors: 0,
      warnings: 0,
      validationFailures: 0,
      avgResponseTime: 0,
    };

    // Calculate health score
    const totalIssues = overallStats.errors * 10 + overallStats.warnings * 3 + overallStats.validationFailures * 5;
    const healthScore = Math.max(0, 100 - totalIssues);

    res.json({
      success: true,
      data: {
        overallHealth: healthScore,
        totalComponents: componentHealth.length,
        totalEvents: overallStats.totalEvents,
        totalErrors: overallStats.errors,
        totalWarnings: overallStats.warnings,
        validationFailures: overallStats.validationFailures,
        avgResponseTime: Math.round(overallStats.avgResponseTime || 0),
        status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
        recentErrors,
      },
    });
  } catch (error) {
    logger.error('Error fetching application health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application health',
      error: error.message,
    });
  }
};

/**
 * Get error analytics
 */
exports.getErrorAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { level: 'error' };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Aggregate error data
    const [errorsByComponent, errorsByType, errorTimeline] = await Promise.all([
      // Errors by component
      MonitoringLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$component',
            count: { $sum: 1 },
            uniqueErrors: { $addToSet: '$error' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Errors by category
      MonitoringLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Error timeline (last 24 hours by hour)
      MonitoringLog.aggregate([
        {
          $match: {
            level: 'error',
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d %H:00',
                date: '$timestamp',
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        errorsByComponent,
        errorsByType,
        errorTimeline,
      },
    });
  } catch (error) {
    logger.error('Error fetching error analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch error analytics',
      error: error.message,
    });
  }
};

/**
 * Get performance metrics
 */
exports.getPerformanceMetrics = async (req, res) => {
  try {
    const { component, startDate, endDate } = req.query;

    const query = { duration: { $exists: true, $ne: null } };
    if (component) query.component = component;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const metrics = await MonitoringLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: component ? '$action' : '$component',
          avgDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' },
          p95Duration: {
            $percentile: {
              input: '$duration',
              p: [0.95],
              method: 'approximate',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          avgDuration: { $round: ['$avgDuration', 2] },
          minDuration: { $round: ['$minDuration', 2] },
          maxDuration: { $round: ['$maxDuration', 2] },
          p95Duration: { $round: [{ $arrayElemAt: ['$p95Duration', 0] }, 2] },
          count: 1,
        },
      },
      { $sort: { avgDuration: -1 } },
    ]);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: error.message,
    });
  }
};

/**
 * Get user journey (session replay)
 */
exports.getUserJourney = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required',
      });
    }

    const journey = await MonitoringLog.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean();

    // Build session summary
    const summary = {
      sessionId,
      startTime: journey[0]?.timestamp,
      endTime: journey[journey.length - 1]?.timestamp,
      duration: journey[journey.length - 1]?.timestamp - journey[0]?.timestamp,
      totalEvents: journey.length,
      components: [...new Set(journey.map(log => log.component).filter(Boolean))],
      errors: journey.filter(log => log.level === 'error').length,
      pages: [...new Set(journey.filter(log => log.category === 'navigation').map(log => log.to))],
    };

    res.json({
      success: true,
      data: {
        summary,
        journey,
      },
    });
  } catch (error) {
    logger.error('Error fetching user journey:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user journey',
      error: error.message,
    });
  }
};

/**
 * Delete old logs (manual cleanup)
 */
exports.cleanupLogs = async (req, res) => {
  try {
    const { daysOld = 30 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

    const result = await MonitoringLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    logger.info(`Deleted ${result.deletedCount} logs older than ${daysOld} days`);

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} logs`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    logger.error('Error cleaning up logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup logs',
      error: error.message,
    });
  }
};
