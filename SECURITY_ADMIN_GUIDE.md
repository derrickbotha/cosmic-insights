# Security, Analytics, Payment & Admin Dashboard Guide

## Overview

This guide covers the comprehensive security, payment processing, user tracking, and admin dashboard features implemented in the Cosmic Astrology application. The system includes enterprise-grade authentication, GDPR-compliant cookie management, dual payment provider support, detailed analytics tracking, and a powerful admin dashboard with real-time monitoring.

---

## 🔐 Authentication & Security (`authService.js`)

### Features

#### JWT-Like Token Authentication
- **Access Tokens**: 24-hour expiration, used for API authentication
- **Refresh Tokens**: 7-day expiration, used to renew access tokens
- **CSRF Tokens**: Protection against cross-site request forgery attacks
- **Token Structure**: `header.payload.signature` (HMAC-SHA256 signed)

#### Password Security
- **Hashing Algorithm**: SHA-256 with secret salt
- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

#### Rate Limiting
- Configurable attempt limits
- Time-window based (default: 15 minutes)
- Prevents brute-force attacks
- Separate tracking per action (login, register, password change)

#### Session Management
- Automatic session tracking
- Event logging for all authentication actions
- User state persistence in localStorage

### API Reference

```javascript
import authService from './services/authService';

// Register a new user
const result = await authService.register(email, password, name);
// Returns: { success: true, user: {...}, token: "..." } or { success: false, error: "..." }

// Login existing user
const result = await authService.login(email, password);
// Returns: { success: true, user: {...}, token: "...", csrfToken: "..." } or { success: false, error: "..." }

// Check if user is authenticated
const isAuth = authService.isAuthenticated();
// Returns: boolean

// Get current user
const user = authService.getCurrentUser();
// Returns: { userId, email, name, role } or null

// Refresh access token
const newToken = authService.refreshAccessToken();
// Returns: new access token string or null

// Change password
const result = authService.changePassword(currentPassword, newPassword);
// Returns: { success: true } or { success: false, error: "..." }

// Logout
authService.logout();

// Verify token manually
const payload = authService.verifyToken(token);
// Returns: decoded payload or null

// Check rate limit
const { allowed, retryAfter } = authService.checkRateLimit('login', 5, 900000);
// Returns: { allowed: boolean, retryAfter: number (ms) }
```

### Integration Example

```javascript
import React, { useState } from 'react';
import authService from './services/authService';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Check rate limit
    const rateLimit = authService.checkRateLimit('login');
    if (!rateLimit.allowed) {
      setError(`Too many attempts. Try again in ${Math.ceil(rateLimit.retryAfter / 60000)} minutes.`);
      return;
    }

    // Attempt login
    const result = await authService.login(email, password);
    
    if (result.success) {
      // Store CSRF token for API requests
      localStorage.setItem('csrf_token', result.csrfToken);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### Security Best Practices

1. **Token Storage**: Tokens are stored in localStorage (frontend demo). For production:
   - Store access tokens in memory or httpOnly cookies
   - Store refresh tokens in httpOnly, secure, sameSite cookies
   - Never expose tokens in URLs or localStorage in production

2. **HTTPS Required**: Always use HTTPS in production to prevent token interception

3. **Token Rotation**: Implement automatic token refresh before expiration

4. **Backend Validation**: All token verification should happen on the backend in production

5. **Password Hashing**: For production, use bcrypt or argon2 on the server (SHA-256 is for demo only)

---

## 📊 Analytics & Tracking (`analyticsService.js`)

### Features

#### Event Tracking
- Page views with referrer tracking
- User interactions (clicks, form submissions)
- Custom events with metadata
- Automatic error capture
- Performance metrics (FCP, TTI, load times)

#### User Journey Tracking
- Session-based user paths
- Complete event timeline per user
- Cross-session journey mapping
- Funnel tracking for conversions

#### Data Export
- JSON and CSV formats
- Filterable by time range
- User-specific or aggregate data

### API Reference

```javascript
import analyticsService from './services/analyticsService';

// Initialize session (automatically called on app start)
analyticsService.initializeSession();

// Track page view
analyticsService.trackPageView('Dashboard', { section: 'home' });

// Track custom event
analyticsService.trackEvent('feature_used', {
  featureName: 'crystal_recommendations',
  interactionType: 'view'
});

// Track button click
analyticsService.trackButtonClick('upgrade_button', { tier: 'premium' });

// Track form submission
analyticsService.trackFormSubmit('contact_form', { category: 'support' });

// Track error
analyticsService.trackError('API call failed', 'high', { endpoint: '/api/user' });

// Track performance
analyticsService.trackPerformance();

// Track conversion
analyticsService.trackConversion('subscription', 19.99, { tier: 'pro' });

// Track funnel step
analyticsService.trackFunnel('checkout', 'payment_info', { tier: 'premium' });

// Get user journey
const journey = analyticsService.getUserJourney(userId, sessionId);
// Returns: Array of event objects sorted by timestamp

// Get analytics summary
const summary = analyticsService.getAnalyticsSummary(30); // last 30 days
/* Returns:
{
  totalEvents: 1523,
  uniqueUsers: 247,
  pageViews: 892,
  interactions: 456,
  errors: 12,
  conversions: 34,
  payments: 28,
  topPages: [{ page: 'Dashboard', count: 234 }, ...],
  topFeatures: [{ feature: 'journal', count: 156 }, ...],
  errorTypes: [{ type: 'API Error', count: 8 }, ...]
}
*/

// Export data
const csvData = analyticsService.exportData('csv');
const jsonData = analyticsService.exportData('json');
```

### Integration Example

```javascript
import React, { useEffect } from 'react';
import analyticsService from './services/analyticsService';

function App() {
  useEffect(() => {
    // Initialize analytics on app mount
    analyticsService.initializeSession();
    
    // Track initial page view
    analyticsService.trackPageView('Home');

    // Track performance metrics after load
    if (window.performance) {
      setTimeout(() => {
        analyticsService.trackPerformance();
      }, 1000);
    }
  }, []);

  const handleFeatureClick = (featureName) => {
    analyticsService.trackInteraction('feature_click', {
      featureName,
      timestamp: Date.now()
    });
  };

  return <div>{/* Your app content */}</div>;
}
```

### Tracked Data Points

Each event includes:
- `eventId`: Unique identifier
- `eventName`: Event type
- `timestamp`: ISO timestamp
- `sessionId`: Current session ID
- `userId`: Current user ID (if authenticated)
- `url`: Current page URL
- `pathname`: URL pathname
- `referrer`: Referring page
- `userAgent`: Browser user agent
- `screenResolution`: Screen dimensions
- `viewportSize`: Viewport dimensions
- Custom event data

### Storage & Performance

- **Storage**: localStorage with 5,000 event limit (automatically pruned)
- **Queue**: Events queued for server transmission (max 100)
- **Sessions**: Session data stored (max 1,000 sessions)
- **Performance**: Non-blocking, async operations

---

## 💳 Payment Processing (`paymentService.js`)

### Features

#### Dual Provider Support
- **Stripe**: Credit card and subscription payments
- **Braintree**: Alternative payment processing

#### Subscription Management
- Create, update, and cancel subscriptions
- Tier-based pricing (Free, Premium, Pro)
- Automatic billing date tracking
- Subscription status monitoring

#### Payment Tracking
- Complete payment history
- Success/failure tracking
- Revenue analytics by provider and tier
- Integration with analytics system

### Pricing Tiers

```javascript
{
  free: {
    price: 0,
    interval: 'month',
    features: ['Basic horoscope', 'Daily insights', 'Limited AI chats']
  },
  premium: {
    price: 9.99,
    interval: 'month',
    features: ['All free features', 'Crystal recommendations', 'Unlimited AI chats', 'Pattern recognition']
  },
  pro: {
    price: 19.99,
    interval: 'month',
    features: ['All premium features', 'Priority support', 'Advanced analytics', 'Custom reports']
  }
}
```

### API Reference

```javascript
import paymentService from './services/paymentService';

// Initialize Stripe
const stripe = await paymentService.initializeStripe();

// Process Stripe payment
const result = await paymentService.processStripePayment(paymentMethodId, 19.99, 'pro');
// Returns: { success: true, paymentId: "...", amount: 19.99 } or { success: false, error: "..." }

// Initialize Braintree
const braintreeInstance = await paymentService.initializeBraintree(containerId);

// Process Braintree payment
const result = await paymentService.processBraintreePayment(nonce, 19.99, 'pro');

// Create subscription
const subscription = await paymentService.createSubscription('premium', 'stripe', 'pm_xxx');
/* Returns:
{
  success: true,
  subscription: {
    id: "sub_xxx",
    userId: "user_xxx",
    tier: "premium",
    status: "active",
    provider: "stripe",
    startDate: "2024-01-01T00:00:00.000Z",
    nextBillingDate: "2024-02-01T00:00:00.000Z",
    amount: 9.99
  }
}
*/

// Cancel subscription
const result = await paymentService.cancelSubscription(subscriptionId);

// Update subscription
const result = await paymentService.updateSubscription(subscriptionId, 'pro');

// Get subscription status
const subscription = paymentService.getSubscriptionStatus(userId);

// Get payment history
const payments = paymentService.getPaymentHistory(userId); // Optional userId filter

// Get tier pricing
const pricing = paymentService.getTierPricing('premium');

// Get payment summary
const summary = paymentService.getPaymentSummary(30); // last 30 days
/* Returns:
{
  totalPayments: 127,
  totalRevenue: 1547.73,
  successfulPayments: 119,
  failedPayments: 8,
  averagePayment: 12.18,
  byProvider: { stripe: 89, braintree: 38 },
  byTier: { premium: 67, pro: 60 }
}
*/
```

### Integration Example (PaymentModal component)

```javascript
import React, { useState } from 'react';
import paymentService from './services/paymentService';
import analyticsService from './services/analyticsService';

function PaymentModal({ tier, onSuccess }) {
  const [provider, setProvider] = useState('stripe');
  const [cardNumber, setCardNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const pricing = paymentService.getTierPricing(tier);
      
      // Process payment
      let paymentResult;
      if (provider === 'stripe') {
        // In production, use Stripe Elements to get paymentMethodId
        paymentResult = await paymentService.processStripePayment(
          'pm_demo',
          pricing.price,
          tier
        );
      } else {
        // In production, use Braintree Drop-in to get nonce
        paymentResult = await paymentService.processBraintreePayment(
          'demo_nonce',
          pricing.price,
          tier
        );
      }

      if (paymentResult.success) {
        // Create subscription
        const subResult = await paymentService.createSubscription(
          tier,
          provider,
          paymentResult.paymentId
        );

        if (subResult.success) {
          // Track conversion
          analyticsService.trackConversion('subscription', pricing.price, {
            tier,
            provider
          });
          
          onSuccess(subResult.subscription);
        }
      } else {
        setError(paymentResult.error);
      }
    } catch (err) {
      setError(err.message);
      analyticsService.trackError('Payment failed', 'high', { error: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Payment form UI */}
    </form>
  );
}
```

### Production Setup

1. **Stripe Setup**:
   - Get API keys from https://dashboard.stripe.com
   - Add publishable key to environment variables
   - Use Stripe Elements for secure card input
   - Implement webhook handlers for subscription events

2. **Braintree Setup**:
   - Get credentials from https://sandbox.braintreegateway.com
   - Add tokenization key to environment variables
   - Use Braintree Drop-in UI for payment collection
   - Configure webhook notifications

3. **Backend Integration**:
   - Create server endpoints for payment processing
   - Store payment records in database
   - Implement subscription lifecycle webhooks
   - Set up billing reminder emails

---

## 🍪 Cookie Consent (`CookieConsent.jsx`)

### Features

#### GDPR Compliance
- Explicit user consent required
- Granular cookie category controls
- Consent timestamp tracking
- Privacy policy integration

#### Cookie Categories
1. **Necessary**: Always active, cannot be disabled (authentication, security)
2. **Analytics**: Optional, user behavior tracking
3. **Marketing**: Optional, advertising and personalization
4. **Functional**: Optional, enhanced user experience features

### Integration Example

```javascript
import React, { useState } from 'react';
import CookieConsent from './components/CookieConsent';
import analyticsService from './services/analyticsService';

function App() {
  const [cookieConsent, setCookieConsent] = useState(null);

  const handleAccept = (preferences) => {
    setCookieConsent(preferences);
    
    // Enable/disable analytics based on consent
    if (preferences.analytics) {
      analyticsService.initializeSession();
    }
  };

  const handleDecline = (preferences) => {
    setCookieConsent(preferences);
    // Only necessary cookies enabled
  };

  return (
    <div>
      <CookieConsent
        darkMode={true}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
      {/* Rest of app */}
    </div>
  );
}
```

### Stored Data

```javascript
// localStorage keys
'cosmic_cookie_consent': { necessary: true, analytics: true, marketing: false, functional: true }
'cosmic_cookie_consent_date': '2024-01-15T10:30:00.000Z'
```

---

## 👨‍💼 Admin Dashboard (`AdminDashboard.jsx`)

### Features

#### Real-Time Monitoring
- Live activity feed (5-second refresh)
- Active user count
- Event stream display
- System health indicators

#### User Management
- User search and filtering
- User detail view with complete journey
- Issue resolution system
- User tier management

#### Analytics Dashboard
- Overview statistics (users, events, pageviews, revenue)
- Top pages and features visualization
- Error type breakdown
- Time range filtering (24h, 7d, 30d)

#### Payment Monitoring
- Payment history table
- Revenue tracking by tier and provider
- Success/failure rates
- Transaction details

#### Data Export
- CSV and JSON export
- Filtered by date range
- Complete analytics data

### Navigation

The admin dashboard has 6 main tabs:

1. **Overview**: High-level statistics and charts
2. **Users**: User management and search
3. **Analytics**: Detailed analytics breakdowns
4. **Payments**: Payment history and revenue
5. **Real-time**: Live activity feed
6. **Issues**: Issue tracking (integrated with user detail)

### API Integration

```javascript
// The dashboard automatically loads data from:
- authService (user list)
- analyticsService (event data, summaries)
- paymentService (payment history, revenue)

// Example: Adding admin-only route
import AdminDashboard from './components/AdminDashboard';
import authService from './services/authService';

function App() {
  const user = authService.getCurrentUser();
  
  return (
    <Router>
      {user?.role === 'admin' && (
        <Route path="/admin" component={AdminDashboard} />
      )}
    </Router>
  );
}
```

### User Detail View

Click any user in the Users tab to see:
- User profile (name, email, tier, join date)
- Complete event timeline (user journey)
- Issue resolution form
- Quick actions (update tier, view payments)

### Issue Resolution

```javascript
// Issue resolution creates a record in localStorage
{
  id: 'issue_xxx',
  userId: 'user_xxx',
  adminId: 'admin_xxx',
  notes: 'Resolved payment issue by...',
  resolvedAt: '2024-01-15T10:30:00.000Z',
  status: 'resolved'
}
```

---

## 🔄 Integration Workflow

### Complete Setup Guide

1. **Install Dependencies**
   ```bash
   npm install crypto-js
   ```

2. **Import Services**
   ```javascript
   import authService from './services/authService';
   import analyticsService from './services/analyticsService';
   import paymentService from './services/paymentService';
   ```

3. **Import Components**
   ```javascript
   import CookieConsent from './components/CookieConsent';
   import AdminDashboard from './components/AdminDashboard';
   import PaymentModal from './components/PaymentModal';
   ```

4. **Initialize on App Mount**
   ```javascript
   useEffect(() => {
     // Check authentication
     if (authService.isAuthenticated()) {
       const user = authService.getCurrentUser();
       setCurrentUser(user);
     }
     
     // Initialize analytics (after cookie consent)
     analyticsService.initializeSession();
     analyticsService.trackPageView('Home');
   }, []);
   ```

5. **Protect Routes**
   ```javascript
   function ProtectedRoute({ component: Component, ...rest }) {
     return (
       <Route
         {...rest}
         render={(props) =>
           authService.isAuthenticated() ? (
             <Component {...props} />
           ) : (
             <Redirect to="/login" />
           )
         }
       />
     );
   }
   ```

6. **Add Admin Access**
   ```javascript
   function AdminRoute({ component: Component, ...rest }) {
     const user = authService.getCurrentUser();
     const isAdmin = user?.role === 'admin';
     
     return (
       <Route
         {...rest}
         render={(props) =>
           isAdmin ? <Component {...props} /> : <Redirect to="/" />
         }
       />
     );
   }
   ```

---

## 📈 Production Deployment Checklist

### Security
- [ ] Move token generation to backend
- [ ] Use httpOnly, secure, sameSite cookies
- [ ] Implement bcrypt/argon2 password hashing on server
- [ ] Add rate limiting middleware on API endpoints
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Add Content Security Policy headers
- [ ] Implement CORS properly
- [ ] Add request signing/validation

### Analytics
- [ ] Set up backend API endpoint for event collection
- [ ] Implement database storage for events
- [ ] Add event aggregation/processing pipeline
- [ ] Set up regular data backups
- [ ] Configure data retention policies
- [ ] Implement privacy-compliant data anonymization

### Payments
- [ ] Get production Stripe/Braintree credentials
- [ ] Set up webhook endpoints
- [ ] Implement subscription lifecycle handlers
- [ ] Add payment retry logic
- [ ] Set up email notifications for billing
- [ ] Implement refund processing
- [ ] Add invoice generation
- [ ] Configure tax calculation

### Admin Dashboard
- [ ] Add authentication for admin routes
- [ ] Implement WebSocket for true real-time updates
- [ ] Add role-based access control (RBAC)
- [ ] Create admin audit log
- [ ] Add data export limits/pagination
- [ ] Implement user impersonation (with logging)

### Monitoring
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure uptime monitoring
- [ ] Add performance monitoring (New Relic, DataDog)
- [ ] Set up log aggregation (ELK, Splunk)
- [ ] Configure alerting for critical events

---

## 📝 LocalStorage Keys Reference

```javascript
// Authentication
'cosmic_users'           // All registered users
'cosmic_auth_token'      // Current access token
'cosmic_refresh_token'   // Current refresh token
'cosmic_csrf_token'      // Current CSRF token
'cosmic_auth_events'     // Authentication event log
'cosmic_rate_limits'     // Rate limiting tracking

// Analytics
'cosmic_analytics_events'    // Event history (max 5000)
'cosmic_analytics_queue'     // Events to send (max 100)
'cosmic_sessions'            // Session data (max 1000)

// Payments
'cosmic_payments'            // Payment records
'cosmic_subscriptions'       // Subscription data
'cosmic_payment_events'      // Payment event log

// Cookie Consent
'cosmic_cookie_consent'      // User preferences
'cosmic_cookie_consent_date' // Consent timestamp

// Admin
'cosmic_issues'              // Issue resolution records
```

---

## 🆘 Troubleshooting

### Authentication Issues

**Problem**: Token expired error
```javascript
// Solution: Use refresh token
const newToken = authService.refreshAccessToken();
if (newToken) {
  // Retry request with new token
}
```

**Problem**: Rate limit exceeded
```javascript
// Solution: Check rate limit status
const { allowed, retryAfter } = authService.checkRateLimit('login');
if (!allowed) {
  console.log(`Retry after ${retryAfter}ms`);
}
```

### Analytics Issues

**Problem**: Events not tracking
```javascript
// Solution: Ensure analytics initialized
analyticsService.initializeSession();

// Check session ID
console.log(analyticsService.sessionId);
```

**Problem**: Storage quota exceeded
```javascript
// Solution: Clear old data
analyticsService.clearData();
```

### Payment Issues

**Problem**: Payment processing fails
```javascript
// Solution: Check payment validation
const result = await paymentService.processStripePayment(...);
if (!result.success) {
  console.error(result.error);
  // Display user-friendly error message
}
```

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Braintree Documentation](https://developers.braintreepayments.com/)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Security Guidelines](https://owasp.org/)

---

## 🤝 Support

For technical support or questions about these features:
1. Check this documentation first
2. Review the inline code comments in each service file
3. Check the browser console for detailed error messages
4. Use the admin dashboard to monitor system health
5. Review analytics data for user behavior insights

---

**Last Updated**: January 2024
**Version**: 1.1.0
