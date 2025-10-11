const mongoose = require('mongoose');

const monitoringLogSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  logId: {
    type: String,
    required: true,
    unique: true,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['lifecycle', 'interaction', 'api', 'error', 'state', 'performance', 'navigation', 'storage'],
    required: true,
    index: true,
  },
  component: {
    type: String,
    index: true,
  },
  action: {
    type: String,
    index: true,
  },
  actionType: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  
  // Validation data
  validation: {
    expected: String,
    actual: String,
    status: {
      type: String,
      enum: ['ok', 'warning', 'error', 'unknown'],
    },
    message: String,
  },

  // API call data
  endpoint: String,
  method: String,
  status: Number,
  
  // Error data
  error: String,
  stack: String,
  
  // Performance data
  duration: Number,
  value: Number,
  threshold: Number,
  
  // State change data
  stateName: String,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  
  // Navigation data
  from: String,
  to: String,
  
  // Storage data
  operation: String,
  key: String,
  success: Boolean,
  
  // Additional data
  props: mongoose.Schema.Types.Mixed,
  result: String,
  interactions: Number,
  errors: Number,
  
  // Browser/User data
  url: String,
  userAgent: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for efficient querying
monitoringLogSchema.index({ timestamp: -1, level: 1 });
monitoringLogSchema.index({ component: 1, timestamp: -1 });
monitoringLogSchema.index({ sessionId: 1, timestamp: -1 });
monitoringLogSchema.index({ 'validation.status': 1, timestamp: -1 });

// TTL index to automatically delete old logs after 30 days
monitoringLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('MonitoringLog', monitoringLogSchema);
