// MongoDB initialization script
// This script runs when the container is first created

// Switch to cosmic-insights database
db = db.getSiblingDB('cosmic-insights');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'name', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address'
        },
        password: {
          bsonType: 'string',
          description: 'must be a hashed password string'
        },
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'must be between 2 and 50 characters'
        },
        role: {
          enum: ['user', 'admin', 'ml_admin', 'analytics_admin'],
          description: 'must be user, admin, ml_admin, or analytics_admin'
        },
        tier: {
          enum: ['free', 'premium', 'pro'],
          description: 'must be free, premium, or pro'
        }
      }
    }
  }
});

db.createCollection('analyticsevents');
db.createCollection('payments');
db.createCollection('subscriptions');

// Create indexes for users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ tier: 1 });
db.users.createIndex({ subscriptionStatus: 1 });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ lastActive: 1 });
db.users.createIndex({ isActive: 1, deletedAt: 1 });

// Create indexes for analytics events
db.analyticsevents.createIndex({ eventId: 1 }, { unique: true });
db.analyticsevents.createIndex({ eventName: 1 });
db.analyticsevents.createIndex({ userId: 1, timestamp: -1 });
db.analyticsevents.createIndex({ sessionId: 1, timestamp: -1 });
db.analyticsevents.createIndex({ timestamp: -1 });
db.analyticsevents.createIndex({ deviceType: 1 });
db.analyticsevents.createIndex({ processed: 1 });
// TTL index - automatically delete documents after 90 days
db.analyticsevents.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Create indexes for payments
db.payments.createIndex({ paymentId: 1 }, { unique: true });
db.payments.createIndex({ userId: 1, createdAt: -1 });
db.payments.createIndex({ status: 1, createdAt: -1 });
db.payments.createIndex({ provider: 1, status: 1 });
db.payments.createIndex({ tier: 1, status: 1 });
db.payments.createIndex({ providerPaymentId: 1 });
db.payments.createIndex({ createdAt: -1 });

// Create indexes for subscriptions
db.subscriptions.createIndex({ subscriptionId: 1 }, { unique: true });
db.subscriptions.createIndex({ userId: 1, status: 1 });
db.subscriptions.createIndex({ status: 1, currentPeriodEnd: 1 });
db.subscriptions.createIndex({ provider: 1, providerSubscriptionId: 1 }, { unique: true });
db.subscriptions.createIndex({ createdAt: -1 });

// Create default admin user (password: Admin123! - bcrypt hashed)
// Note: Change this password immediately in production!
db.users.insertOne({
  email: 'admin@cosmicinsights.com',
  password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5OU5x1E3/YJpa', // Admin123!
  name: 'Admin User',
  role: 'admin',
  tier: 'pro',
  emailVerified: true,
  isActive: true,
  subscriptionStatus: 'active',
  preferences: {
    darkMode: false,
    notifications: {
      email: true,
      push: true
    }
  },
  cookieConsent: {
    necessary: true,
    analytics: true,
    marketing: false,
    functional: true,
    consentDate: new Date()
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  lastActive: new Date()
});

// Create test user (password: TestUser123! - bcrypt hashed)
db.users.insertOne({
  email: 'test@cosmicinsights.com',
  password: '$2b$12$9vYMx8p4cjK.F2pF7Y5.8uHB8TQC4RjN4xG8mN5L9yQ8zK3xW5vRG', // TestUser123!
  name: 'Test User',
  role: 'user',
  tier: 'free',
  emailVerified: true,
  isActive: true,
  subscriptionStatus: null,
  astrology: {
    sunSign: 'Aries',
    moonSign: 'Taurus',
    risingSign: 'Gemini',
    birthDate: new Date('1990-01-15'),
    birthPlace: 'New York, USA'
  },
  preferences: {
    darkMode: true,
    notifications: {
      email: true,
      push: false
    }
  },
  cookieConsent: {
    necessary: true,
    analytics: true,
    marketing: false,
    functional: true,
    consentDate: new Date()
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  lastActive: new Date()
});

print('✅ Database initialized successfully!');
print('📊 Collections created: users, analyticsevents, payments, subscriptions');
print('🔍 Indexes created for optimal query performance');
print('👤 Default users created:');
print('   - Admin: admin@cosmicinsights.com / Admin123!');
print('   - Test User: test@cosmicinsights.com / TestUser123!');
print('⚠️  IMPORTANT: Change default passwords in production!');
