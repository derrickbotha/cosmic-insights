const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
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
  tier: {
    type: String,
    enum: ['premium', 'pro'],
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['stripe', 'braintree'],
    required: true,
    index: true
  },
  providerPaymentId: {
    type: String,
    required: true,
    index: true
  },
  providerCustomerId: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'disputed'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer', 'other']
    },
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  receiptUrl: String,
  receiptNumber: String,
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundedAt: Date,
  refundReason: String,
  failureReason: String,
  failureCode: String,
  paidAt: Date,
  processedAt: Date
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ provider: 1, status: 1 });
paymentSchema.index({ tier: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ providerPaymentId: 1 });

// Virtual for net amount after refunds
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.refundedAmount;
});

// Static method to get payment summary
paymentSchema.statics.getPaymentSummary = async function(startDate, endDate, userId = null) {
  const matchQuery = {
    createdAt: { $gte: startDate, $lte: endDate }
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
              totalPayments: { $sum: 1 },
              totalRevenue: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', 'succeeded'] },
                    '$amount',
                    0
                  ]
                }
              },
              totalRefunded: { $sum: '$refundedAmount' },
              successfulPayments: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0]
                }
              },
              failedPayments: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
                }
              },
              refundedPayments: {
                $sum: {
                  $cond: [{ $gt: ['$refundedAmount', 0] }, 1, 0]
                }
              }
            }
          }
        ],
        byProvider: [
          {
            $group: {
              _id: '$provider',
              count: { $sum: 1 },
              revenue: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', 'succeeded'] },
                    '$amount',
                    0
                  ]
                }
              }
            }
          }
        ],
        byTier: [
          {
            $group: {
              _id: '$tier',
              count: { $sum: 1 },
              revenue: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', 'succeeded'] },
                    '$amount',
                    0
                  ]
                }
              }
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
        recentPayments: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              paymentId: 1,
              amount: 1,
              currency: 1,
              tier: 1,
              provider: 1,
              status: 1,
              createdAt: 1,
              'user.name': 1,
              'user.email': 1
            }
          }
        ]
      }
    }
  ];
  
  const results = await this.aggregate(pipeline);
  
  if (results.length === 0) return null;
  
  const data = results[0];
  const overview = data.overview[0] || {};
  
  return {
    totalPayments: overview.totalPayments || 0,
    totalRevenue: overview.totalRevenue || 0,
    totalRefunded: overview.totalRefunded || 0,
    netRevenue: (overview.totalRevenue || 0) - (overview.totalRefunded || 0),
    successfulPayments: overview.successfulPayments || 0,
    failedPayments: overview.failedPayments || 0,
    refundedPayments: overview.refundedPayments || 0,
    successRate: overview.totalPayments
      ? ((overview.successfulPayments || 0) / overview.totalPayments * 100).toFixed(2)
      : 0,
    averagePayment: overview.successfulPayments
      ? (overview.totalRevenue / overview.successfulPayments).toFixed(2)
      : 0,
    byProvider: data.byProvider,
    byTier: data.byTier,
    byStatus: data.byStatus,
    recentPayments: data.recentPayments
  };
};

// Static method to get user payment history
paymentSchema.statics.getUserPayments = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Method to mark as succeeded
paymentSchema.methods.markSucceeded = function() {
  this.status = 'succeeded';
  this.paidAt = new Date();
  this.processedAt = new Date();
  return this.save();
};

// Method to mark as failed
paymentSchema.methods.markFailed = function(reason, code) {
  this.status = 'failed';
  this.failureReason = reason;
  this.failureCode = code;
  this.processedAt = new Date();
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = function(amount, reason) {
  this.refundedAmount += amount;
  if (this.refundedAmount >= this.amount) {
    this.status = 'refunded';
  }
  this.refundedAt = new Date();
  this.refundReason = reason;
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
