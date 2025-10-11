const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  eventName: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  url: String,
  pathname: {
    type: String,
    index: true
  },
  referrer: String,
  userAgent: String,
  ipAddress: String,
  country: String,
  city: String,
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'other'],
    index: true
  },
  browser: String,
  os: String,
  screenResolution: String,
  viewportSize: String,
  language: String,
  
  // Event-specific data
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Performance metrics
  performanceMetrics: {
    loadTime: Number,
    firstContentfulPaint: Number,
    timeToInteractive: Number,
    domContentLoaded: Number
  },
  
  // Error tracking
  error: {
    message: String,
    stack: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  },
  
  // Conversion tracking
  conversion: {
    type: {
      type: String
    },
    value: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // A/B Testing
  experimentId: String,
  variantId: String,
  
  // Processed flag
  processed: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true,
  // TTL index - automatically delete documents after 90 days
  expireAfterSeconds: 7776000 // 90 days
});

// Indexes for query performance
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: -1 });
analyticsEventSchema.index({ eventName: 1, timestamp: -1 });
analyticsEventSchema.index({ timestamp: -1, processed: 1 });
analyticsEventSchema.index({ 'conversion.type': 1, timestamp: -1 });
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Static method to get events by user
analyticsEventSchema.statics.getUserJourney = function(userId, sessionId = null, limit = 100) {
  const query = { userId };
  if (sessionId) query.sessionId = sessionId;
  
  return this.find(query)
    .sort({ timestamp: 1 })
    .limit(limit)
    .lean();
};

// Static method to get analytics summary
analyticsEventSchema.statics.getAnalyticsSummary = async function(startDate, endDate, userId = null) {
  const matchQuery = {
    timestamp: { $gte: startDate, $lte: endDate }
  };
  
  if (userId) matchQuery.userId = userId;
  
  const pipeline = [
    { $match: matchQuery },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalEvents: { $sum: 1 },
              uniqueUsers: { $addToSet: '$userId' },
              uniqueSessions: { $addToSet: '$sessionId' }
            }
          }
        ],
        pageViews: [
          {
            $match: { eventName: 'page_view' }
          },
          {
            $group: {
              _id: '$pathname',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        topEvents: [
          {
            $group: {
              _id: '$eventName',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        conversions: [
          {
            $match: { 'conversion.type': { $exists: true } }
          },
          {
            $group: {
              _id: '$conversion.type',
              count: { $sum: 1 },
              totalValue: { $sum: '$conversion.value' }
            }
          }
        ],
        errors: [
          {
            $match: { 'error.message': { $exists: true } }
          },
          {
            $group: {
              _id: '$error.severity',
              count: { $sum: 1 }
            }
          }
        ],
        deviceTypes: [
          {
            $group: {
              _id: '$deviceType',
              count: { $sum: 1 }
            }
          }
        ],
        avgPerformance: [
          {
            $match: { 'performanceMetrics.loadTime': { $exists: true } }
          },
          {
            $group: {
              _id: null,
              avgLoadTime: { $avg: '$performanceMetrics.loadTime' },
              avgFCP: { $avg: '$performanceMetrics.firstContentfulPaint' },
              avgTTI: { $avg: '$performanceMetrics.timeToInteractive' }
            }
          }
        ]
      }
    }
  ];
  
  const results = await this.aggregate(pipeline);
  
  if (results.length === 0) return null;
  
  const data = results[0];
  
  return {
    totalEvents: data.overview[0]?.totalEvents || 0,
    uniqueUsers: data.overview[0]?.uniqueUsers.length || 0,
    uniqueSessions: data.overview[0]?.uniqueSessions.length || 0,
    topPages: data.pageViews,
    topEvents: data.topEvents,
    conversions: data.conversions,
    errors: data.errors,
    deviceTypes: data.deviceTypes,
    avgPerformance: data.avgPerformance[0] || {}
  };
};

// Static method to get real-time events
analyticsEventSchema.statics.getRealtimeEvents = function(limit = 50) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email tier')
    .lean();
};

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;
