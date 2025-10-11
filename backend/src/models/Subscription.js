const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tier: {
    type: String,
    enum: ['premium', 'pro'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'past_due', 'trialing', 'paused'],
    default: 'active',
    index: true
  },
  provider: {
    type: String,
    enum: ['stripe', 'braintree'],
    required: true
  },
  providerSubscriptionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  providerCustomerId: String,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  intervalCount: {
    type: Number,
    default: 1
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true,
    index: true
  },
  trialStart: Date,
  trialEnd: Date,
  canceledAt: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelReason: String,
  endedAt: Date,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  paymentHistory: [{
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    date: Date,
    amount: Number,
    status: String
  }]
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
subscriptionSchema.index({ provider: 1, providerSubscriptionId: 1 });
subscriptionSchema.index({ createdAt: -1 });

// Virtual for is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.currentPeriodEnd > new Date();
});

// Virtual for days remaining
subscriptionSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.currentPeriodEnd);
  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to cancel subscription
subscriptionSchema.methods.cancel = function(reason = '', immediately = false) {
  this.canceledAt = new Date();
  this.cancelReason = reason;
  
  if (immediately) {
    this.status = 'canceled';
    this.endedAt = new Date();
  } else {
    this.cancelAtPeriodEnd = true;
  }
  
  return this.save();
};

// Method to reactivate subscription
subscriptionSchema.methods.reactivate = function() {
  this.status = 'active';
  this.canceledAt = null;
  this.cancelAtPeriodEnd = false;
  this.cancelReason = null;
  return this.save();
};

// Method to update billing cycle
subscriptionSchema.methods.updateBillingCycle = function(currentPeriodStart, currentPeriodEnd) {
  this.currentPeriodStart = currentPeriodStart;
  this.currentPeriodEnd = currentPeriodEnd;
  return this.save();
};

// Method to add payment to history
subscriptionSchema.methods.addPayment = function(paymentId, amount, status) {
  this.paymentHistory.push({
    paymentId,
    date: new Date(),
    amount,
    status
  });
  
  // Keep only last 12 payments
  if (this.paymentHistory.length > 12) {
    this.paymentHistory = this.paymentHistory.slice(-12);
  }
  
  return this.save();
};

// Static method to get active subscriptions expiring soon
subscriptionSchema.statics.getExpiringSubscriptions = function(daysAhead = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: 'active',
    currentPeriodEnd: {
      $gte: now,
      $lte: futureDate
    }
  })
  .populate('userId', 'name email')
  .lean();
};

// Static method to get subscription summary
subscriptionSchema.statics.getSubscriptionSummary = async function(startDate = null, endDate = null) {
  const matchQuery = {};
  
  if (startDate && endDate) {
    matchQuery.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  const pipeline = [
    { $match: matchQuery },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalSubscriptions: { $sum: 1 },
              activeSubscriptions: {
                $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
              },
              canceledSubscriptions: {
                $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] }
              },
              trialingSubscriptions: {
                $sum: { $cond: [{ $eq: ['$status', 'trialing'] }, 1, 0] }
              },
              monthlyRevenue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$status', 'active'] },
                        { $eq: ['$interval', 'month'] }
                      ]
                    },
                    '$amount',
                    0
                  ]
                }
              },
              yearlyRevenue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$status', 'active'] },
                        { $eq: ['$interval', 'year'] }
                      ]
                    },
                    { $divide: ['$amount', 12] }, // Convert to monthly
                    0
                  ]
                }
              }
            }
          }
        ],
        byTier: [
          {
            $match: { status: 'active' }
          },
          {
            $group: {
              _id: '$tier',
              count: { $sum: 1 },
              revenue: { $sum: '$amount' }
            }
          }
        ],
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        churnRate: [
          {
            $match: {
              status: 'canceled',
              canceledAt: { $exists: true }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m',
                  date: '$canceledAt'
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: -1 } },
          { $limit: 6 }
        ]
      }
    }
  ];
  
  const results = await this.aggregate(pipeline);
  
  if (results.length === 0) return null;
  
  const data = results[0];
  const overview = data.overview[0] || {};
  
  const mrr = (overview.monthlyRevenue || 0) + (overview.yearlyRevenue || 0);
  const arr = mrr * 12;
  
  return {
    totalSubscriptions: overview.totalSubscriptions || 0,
    activeSubscriptions: overview.activeSubscriptions || 0,
    canceledSubscriptions: overview.canceledSubscriptions || 0,
    trialingSubscriptions: overview.trialingSubscriptions || 0,
    monthlyRecurringRevenue: mrr.toFixed(2),
    annualRecurringRevenue: arr.toFixed(2),
    churnRate: data.churnRate,
    byTier: data.byTier,
    byStatus: data.byStatus
  };
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
