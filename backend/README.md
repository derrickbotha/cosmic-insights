# Cosmic Insights Backend API

Production-ready backend API for the Cosmic Insights Astrology App with enterprise-grade security, authentication, analytics, and payment processing.

## Features

- 🔐 **Secure Authentication**: bcrypt password hashing (12 rounds), JWT tokens (access + refresh), email verification
- 🛡️ **Enterprise Security**: Helmet CSP headers, CORS, rate limiting, CSRF protection, input validation, NoSQL injection prevention
- 📊 **Analytics**: Event tracking with TTL auto-cleanup, aggregation pipelines, real-time monitoring, CSV export
- 💳 **Payment Processing**: Stripe and Braintree integration (ready for webhooks)
- 🔒 **Account Security**: Login attempt tracking with 15-minute lockout after 5 failed attempts
- 📝 **Logging**: Winston with file rotation (error.log, combined.log, exceptions.log, rejections.log)
- 🚀 **Performance**: MongoDB indexing, connection pooling, compression, Redis-ready for caching

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: bcrypt + JWT (jsonwebtoken)
- **Security**: helmet, cors, express-rate-limit, express-validator, express-mongo-sanitize, hpp
- **Logging**: Winston with file rotation
- **Payments**: Stripe 14.7, Braintree 3.20
- **Real-time**: Socket.IO 4.6 (configured, not yet implemented)
- **Email**: Nodemailer 6.9 (configured, not yet implemented)

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- MongoDB 5.0 or higher (local or MongoDB Atlas)
- (Optional) Redis for session caching

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the `.env.example` file to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

**Required Configuration:**

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cosmic-insights

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your_secure_access_secret_here
JWT_REFRESH_SECRET=your_secure_refresh_secret_here

# Security
CSRF_SECRET=your_csrf_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key
COOKIE_SECRET=your_cookie_secret_here

# CORS
CORS_ORIGIN=http://localhost:3000

# Client
CLIENT_URL=http://localhost:3000
```

**Generate Secure Secrets:**

```bash
# Generate random secrets in Node.js REPL
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod --dbpath /path/to/data/directory
```

**MongoDB Atlas:**
Update `MONGODB_URI` in `.env` with your Atlas connection string.

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| POST | `/api/auth/refresh` | Refresh access token | Public (with refresh token) |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password with token | Public |
| GET | `/api/auth/verify-email/:token` | Verify email address | Public |
| POST | `/api/auth/resend-verification` | Resend verification email | Private |
| GET | `/api/auth/me` | Get current user profile | Private |
| PATCH | `/api/auth/profile` | Update user profile | Private |

### Analytics

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/analytics/event` | Track single event | Public |
| POST | `/api/analytics/events/batch` | Track multiple events | Public |
| GET | `/api/analytics/summary` | Get analytics summary | Private |
| GET | `/api/analytics/journey/:userId` | Get user journey | Private |
| GET | `/api/analytics/realtime` | Get real-time events | Admin |
| GET | `/api/analytics/events` | Get paginated events | Private |
| GET | `/api/analytics/export` | Export analytics (CSV/JSON) | Admin |
| DELETE | `/api/analytics/cleanup` | Delete old events | Admin |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/health` | Server health status | Public |

## Security Features

### Password Requirements
- Minimum 8 characters, maximum 128 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Hashed with bcrypt (12 rounds)

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 attempts per 15 minutes per IP
- **Login attempts**: Account locked for 15 minutes after 5 failed attempts

### JWT Tokens
- **Access Token**: 15 minutes expiry, used for API authentication
- **Refresh Token**: 7 days expiry, stored in httpOnly cookie, max 5 per user
- Tokens invalidated on password change
- Refresh token rotation on each use

### Security Headers (Helmet)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

### Input Validation
- express-validator for all inputs
- express-mongo-sanitize prevents NoSQL injection
- hpp prevents HTTP parameter pollution

## Database Models

### User
- Authentication: email, password (bcrypt), email verification
- Authorization: role (user/admin), tier (free/premium/pro)
- Subscription: subscriptionId, status, endDate, stripeCustomerId, braintreeCustomerId
- Security: login attempts with lockout, password reset tokens
- Profile: astrology data (sun/moon/rising signs, birth info), preferences
- Refresh tokens: array with max 5 tokens per user
- Soft delete: isActive flag

### AnalyticsEvent
- Event tracking: eventName, userId, sessionId, timestamp
- User context: userAgent, ipAddress, country, city, deviceType, browser, os
- Performance: loadTime, firstContentfulPaint, timeToInteractive
- Error tracking: message, stack, severity
- Conversion tracking: type, value, currency
- A/B testing: experimentId, variantId
- TTL: Auto-delete after 90 days

### Payment (Not yet implemented)
- Transaction tracking: paymentId, userId, amount, currency, tier
- Provider: stripe/braintree, providerPaymentId, providerCustomerId
- Status: pending, processing, succeeded, failed, refunded, disputed
- Payment method: type, last4, brand, expiry
- Refunds: refundedAmount, refundReason

### Subscription (Not yet implemented)
- Subscription management: subscriptionId, userId, tier, status
- Provider: stripe/braintree, providerSubscriptionId
- Billing: amount, currency, interval (month/year)
- Periods: startDate, currentPeriodStart, currentPeriodEnd, trial periods
- Cancellation: canceledAt, cancelAtPeriodEnd, cancelReason
- Payment history: last 12 payments

## Logging

Logs are stored in the `logs/` directory:

- **error.log**: Only error-level logs
- **combined.log**: All logs (info, warn, error)
- **exceptions.log**: Uncaught exceptions
- **rejections.log**: Unhandled promise rejections

**Log rotation**: 5MB max file size, keeps last 5 files

**Log levels**:
- `error`: Error messages
- `warn`: Warning messages
- `info`: Informational messages (default)
- `debug`: Debug messages (set LOG_LEVEL=debug in .env)

## Testing (Coming Soon)

```bash
npm test
```

## Production Deployment

### Environment Variables

Ensure all production environment variables are set:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_ACCESS_SECRET=secure_production_secret
JWT_REFRESH_SECRET=secure_production_secret
# ... all other required variables
```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add your IP address to the whitelist
4. Create a database user
5. Get the connection string and update `MONGODB_URI`

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique secrets for JWT, CSRF, cookies, encryption
- [ ] Configure MongoDB Atlas or production MongoDB instance
- [ ] Set up Redis for session caching (optional but recommended)
- [ ] Configure CORS_ORIGIN to your production frontend URL
- [ ] Set up Stripe and/or Braintree production credentials
- [ ] Configure email service (SMTP or SendGrid)
- [ ] Enable HTTPS (secure cookies require it)
- [ ] Set up monitoring (Sentry DSN in .env)
- [ ] Configure log retention and rotation
- [ ] Set up automated backups for MongoDB
- [ ] Review and test all rate limits
- [ ] Run security audit: `npm audit`

## Docker Support (Coming Soon)

```bash
docker-compose up -d
```

## Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Run `npm test` before committing

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
