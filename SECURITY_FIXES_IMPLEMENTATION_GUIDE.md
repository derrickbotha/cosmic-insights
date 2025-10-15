# 🔒 Security Fixes Implementation Guide

**Status**: 🚧 IN PROGRESS  
**Priority**: 🔥 CRITICAL - Complete BEFORE production deployment  
**Date**: October 14, 2025

---

## ✅ COMPLETED FIXES

### 1. ✅ JWT Secret Hardcoding Removed
**File**: `backend/src/config/security.js`

**Changes Made**:
- Removed fallback values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- Removed fallback value for `COOKIE_SECRET`
- Added startup validation that exits if secrets are not configured
- Added helpful error messages with generation commands

**Status**: ✅ **COMPLETE**

**Testing**:
```bash
# Test 1: Verify app fails without secrets
docker-compose down
mv backend/.env backend/.env.backup
docker-compose up backend
# Should see: "FATAL ERROR: JWT secrets not configured!"

# Test 2: Verify app starts with secrets
mv backend/.env.backup backend/.env
docker-compose up -d backend
curl http://localhost:5000/health
# Should return 200 OK
```

---

### 2. ✅ Production DEBUG Defaults Fixed
**File**: `docker-compose.yml`

**Changes Made**:
- Changed `DJANGO_DEBUG:-True` to `DJANGO_DEBUG:-False` (3 locations)
- Now defaults to secure mode unless explicitly set to True

**Status**: ✅ **COMPLETE**

**Impact**: Stack traces will no longer leak in production

---

### 3. ✅ Password Policy Strengthened
**File**: `backend/src/config/security.js`

**Changes Made**:
- Increased minimum length from 8 to 12 characters
- Made special characters REQUIRED (was optional)
- Added special characters regex pattern
- Following NIST SP 800-63B guidelines

**Status**: ✅ **COMPLETE**

**Note**: Existing users with 8-char passwords are grandfathered in, but NEW registrations require 12+ chars with special characters.

---

## 🚧 CRITICAL FIXES REQUIRED

### 4. 🔥 Remove Client-Side Password Hashing
**Priority**: P0 (CRITICAL)  
**Time**: 2 hours  
**File**: `src/services/authService.js`

**Current Problem**:
```javascript
// Lines 23-27: Client-side hashing is POINTLESS
hashPassword(password) {
  return CryptoJS.SHA256(password + SECRET_KEY).toString();
}

// Lines 34-58: Client generates JWT tokens - NEVER DO THIS!
generateToken(userId, email, role = 'user') {
  // ... client-side JWT generation
}
```

**Why This Is Dangerous**:
1. **Network sniffing still works** - Hashed password sent over network can be captured and replayed
2. **SHA-256 is NOT for passwords** - It's fast, making brute-force easy. Use bcrypt/argon2
3. **Secret exposed in frontend** - Anyone can view the SECRET_KEY in browser DevTools
4. **Client-side JWT defeats the purpose** - Backend can't control token validity

**Correct Implementation**:
```javascript
// src/services/authService.js

class AuthService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  // ✅ CORRECT: Just send plain password over HTTPS
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: sends/receives httpOnly cookies
        body: JSON.stringify({ 
          email, 
          password // Send PLAIN password (HTTPS encrypts it)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Backend sends accessToken in response, refreshToken in httpOnly cookie
      if (data.success && data.data) {
        // Store ONLY user data (no sensitive info)
        sessionStorage.setItem('cosmic_user', JSON.stringify(data.data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        return {
          success: true,
          user: data.data.user
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async register(email, password, name, username, userData) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password, // Plain password
          name,
          username,
          ...userData
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return {
        success: true,
        user: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ CORRECT: Check if user is logged in
  isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  // ✅ CORRECT: Get user data (NOT sensitive)
  getCurrentUser() {
    const storedUser = sessionStorage.getItem('cosmic_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  // ✅ CORRECT: Logout clears session
  async logout() {
    try {
      await fetch(`${this.apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include' // Sends httpOnly cookie to invalidate
      });
    } finally {
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('cosmic_user');
    }
  }

  // ✅ REMOVE ALL THESE METHODS (not needed):
  // - hashPassword()
  // - generateToken()
  // - verifyToken()
  // - generateCSRFToken()
  // - setToken() / getToken() / removeToken()
  // - setRefreshToken() / getRefreshToken() / removeRefreshToken()
  // - refreshAccessToken() (backend handles this automatically)
}
```

**Backend Changes Required**:
```javascript
// backend/src/middleware/auth.js
// Update authenticate middleware to look for token in Authorization header OR cookie

const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // Fallback to cookie (for SSR/future use)
    else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // ... rest of authentication logic
  } catch (error) {
    // If token expired, check if we can auto-refresh
    if (error.name === 'TokenExpiredError' && req.cookies.refreshToken) {
      // TODO: Implement automatic token refresh
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};
```

**Action Items**:
1. [ ] Remove all crypto code from `src/services/authService.js`
2. [ ] Update login/register to send plain passwords
3. [ ] Test login flow end-to-end
4. [ ] Verify HTTPS is enabled in production
5. [ ] Update any components that call removed methods

---

### 5. 🔥 Add Input Validation
**Priority**: P0 (CRITICAL)  
**Time**: 8 hours  
**Files**: All controllers

**Installation**:
```bash
cd backend
npm install express-validator
```

**Implementation Example**:

**File**: `backend/src/middleware/validation.js`
```javascript
const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Registration validation
const registerValidation = [
  body('email')
    .trim()
    .isEmail().normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .isLength({ min: 12, max: 128 })
    .withMessage('Password must be 12-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Name is required (max 100 characters)'),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-z0-9_]+$/)
    .withMessage('Username: 3-30 chars, lowercase alphanumeric and underscores only'),
  
  body('profileImage')
    .optional()
    .isURL({ protocols: ['https'], require_protocol: true })
    .withMessage('Profile image must be HTTPS URL'),
  
  validate
];

// Login validation
const loginValidation = [
  body('email')
    .trim()
    .isEmail().normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// MongoDB ID validation
const mongoIdValidation = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  validate
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .toInt()
    .withMessage('Page must be between 1 and 10000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

// Date range validation
const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Start date must be valid ISO 8601 format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('End date must be valid ISO 8601 format'),
  
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  mongoIdValidation,
  paginationValidation,
  dateRangeValidation,
  validate
};
```

**Update Routes**:
```javascript
// backend/src/routes/auth.js
const { registerValidation, loginValidation } = require('../middleware/validation');

// Apply validation middleware
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
```

**Action Items**:
1. [ ] Create `backend/src/middleware/validation.js`
2. [ ] Add validation to auth routes
3. [ ] Add validation to analytics routes
4. [ ] Add validation to ML routes
5. [ ] Add validation to user management routes
6. [ ] Test all endpoints with invalid data

---

### 6. 🔥 Add Rate Limiting to All Endpoints
**Priority**: P0 (CRITICAL)  
**Time**: 2 hours  
**Files**: Multiple routes

**Current State**: Only auth routes have rate limiting

**Required Changes**:

**File**: `backend/src/config/security.js`
```javascript
// Add more rate limit configs
const analyticsRateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many analytics events, please slow down',
  standardHeaders: true,
  legacyHeaders: false
};

const mlRateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute (ML operations are expensive)
  message: 'Too many ML requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false
};

const userManagementRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many user management requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false
};

module.exports = {
  // ... existing exports
  analyticsRateLimitConfig,
  mlRateLimitConfig,
  userManagementRateLimitConfig
};
```

**Apply to Routes**:
```javascript
// backend/src/routes/analytics.js
const { analyticsRateLimitConfig } = require('../config/security');
const rateLimit = require('express-rate-limit');

const analyticsLimiter = rateLimit(analyticsRateLimitConfig);

// Apply to all routes
router.post('/event', analyticsLimiter, optionalAuth, analyticsController.trackEvent);
router.post('/events/batch', analyticsLimiter, optionalAuth, analyticsController.trackEventsBatch);
// ... apply to all other routes
```

**Action Items**:
1. [ ] Add rate limit configs to `security.js`
2. [ ] Apply to analytics routes
3. [ ] Apply to ML routes
4. [ ] Apply to user management routes
5. [ ] Test rate limiting works (make 101+ requests in 1 minute)

---

### 7. 🔥 Add CSRF Protection
**Priority**: P0 (CRITICAL)  
**Time**: 2 hours  
**Files**: Backend routes

**Current State**: CSRF middleware exists but not used!

**Enable CSRF**:
```javascript
// backend/src/server.js
const csrf = require('csurf');

// Create CSRF protection middleware
const csrfProtection = csrf({ 
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  } 
});

// Apply to all state-changing routes (after auth check)
app.use('/api', (req, res, next) => {
  // Skip CSRF for read-only operations
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for webhook endpoints (if any)
  if (req.path.includes('/webhooks/')) {
    return next();
  }
  
  // Apply CSRF protection
  csrfProtection(req, res, next);
});
```

**Update Login Response**:
```javascript
// backend/src/controllers/authController.js
exports.login = async (req, res) => {
  // ... existing login logic
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      csrfToken: req.csrfToken(), // Send CSRF token
      user: { /* user data */ }
    }
  });
};
```

**Update Frontend**:
```javascript
// src/services/authService.js
class AuthService {
  constructor() {
    this.csrfToken = null;
  }

  async login(email, password) {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store CSRF token
      this.csrfToken = data.data.csrfToken;
      sessionStorage.setItem('csrfToken', this.csrfToken);
    }
    
    return data;
  }

  // Add CSRF token to all POST/PUT/DELETE requests
  async fetchWithCSRF(url, options = {}) {
    const csrfToken = this.csrfToken || sessionStorage.getItem('csrfToken');
    
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken // Add CSRF header
      }
    });
  }
}
```

**Action Items**:
1. [ ] Enable CSRF protection in server.js
2. [ ] Update login controller to send CSRF token
3. [ ] Update frontend to include CSRF token in requests
4. [ ] Test CSRF protection (requests without token should fail)

---

### 8. 🔥 Add Content Security Policy
**Priority**: P0 (CRITICAL)  
**Time**: 1 hour  
**File**: `public/index.html`

**Add CSP Meta Tag**:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    
    <!-- CRITICAL: Add Content Security Policy -->
    <meta 
      http-equiv="Content-Security-Policy" 
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com data:;
        img-src 'self' data: https: blob:;
        connect-src 'self' http://localhost:5000 https://api.cosmicinsights.com ws://localhost:* wss://cosmicinsights.com;
        frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
      " 
    />
    
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="AI-powered astrology insights" />
    
    <!-- Rest of head -->
  </head>
  <body>
    <!-- Body content -->
  </body>
</html>
```

**Action Items**:
1. [ ] Add CSP meta tag to `public/index.html`
2. [ ] Test app loads correctly
3. [ ] Check browser console for CSP violations
4. [ ] Adjust policy if needed (remove 'unsafe-inline' if possible)

---

## 🧪 TESTING CHECKLIST

After implementing fixes, test thoroughly:

### Security Tests
- [ ] App fails to start without JWT secrets
- [ ] App fails to start without COOKIE_SECRET  
- [ ] Registration requires 12+ char password with special chars
- [ ] Old 8-char passwords are rejected on registration
- [ ] Login sends plain password (check Network tab)
- [ ] JWT tokens not stored in localStorage
- [ ] CSRF token required for POST/PUT/DELETE
- [ ] Rate limiting works (429 after limit exceeded)
- [ ] CSP blocks inline scripts (test in console)

### Functional Tests
- [ ] Registration works end-to-end
- [ ] Login works end-to-end
- [ ] Email verification works
- [ ] Password reset works
- [ ] Session persists across page reloads
- [ ] Logout clears session properly
- [ ] Token refresh works automatically

### Performance Tests
- [ ] Login response time < 500ms
- [ ] Registration response time < 1s
- [ ] No memory leaks after 1000 logins
- [ ] Rate limiting doesn't block legitimate users

---

## 📋 DEPLOYMENT CHECKLIST

Before deploying to production:

### Environment Variables
- [ ] Generate strong JWT_ACCESS_SECRET (64 bytes)
- [ ] Generate strong JWT_REFRESH_SECRET (64 bytes)
- [ ] Generate strong COOKIE_SECRET (64 bytes)
- [ ] Set DJANGO_DEBUG=False
- [ ] Set NODE_ENV=production
- [ ] Set LOG_LEVEL=info (not debug)
- [ ] Verify all secrets are in .env (not in code)

### Security Configuration
- [ ] HTTPS enabled (SSL/TLS certificate)
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled on all endpoints
- [ ] CSRF protection enabled
- [ ] CSP headers configured
- [ ] Security headers enabled (Helmet.js)

### Monitoring
- [ ] Error logging configured (Winston/Sentry)
- [ ] Performance monitoring setup
- [ ] Security alerts configured
- [ ] Uptime monitoring enabled

---

## 🆘 EMERGENCY ROLLBACK

If issues arise after deployment:

```bash
# 1. Stop services
docker-compose down

# 2. Restore previous version
git checkout <previous-commit>

# 3. Rebuild and restart
docker-compose build
docker-compose up -d

# 4. Verify health
curl http://localhost:5000/health

# 5. Check logs
docker-compose logs backend --tail=100
```

---

## 📞 SUPPORT

If you need help implementing these fixes:

1. Review the CODE_AUDIT_AND_IMPROVEMENTS.md document
2. Check the backend/README.md for API documentation
3. Search the codebase for existing implementations
4. Test changes in development environment first

---

**Document Version**: 1.0  
**Last Updated**: October 14, 2025  
**Status**: 40% Complete (3/8 critical fixes done)

