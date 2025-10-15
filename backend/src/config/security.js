const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// JWT configuration
const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  }
};

// CRITICAL: Validate required secrets on startup
if (!jwtConfig.accessToken.secret || !jwtConfig.refreshToken.secret) {
  console.error('FATAL ERROR: JWT secrets not configured!');
  console.error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
  console.error('Generate secrets with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

// Warn if using weak default secrets
const weakSecrets = ['dev_access_secret', 'dev_refresh_secret', 'change_in_production', 'secret-key'];
const isWeakAccessSecret = weakSecrets.some(weak => jwtConfig.accessToken.secret.includes(weak));
const isWeakRefreshSecret = weakSecrets.some(weak => jwtConfig.refreshToken.secret.includes(weak));

if (isWeakAccessSecret || isWeakRefreshSecret) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: Weak JWT secrets detected in PRODUCTION mode!');
    console.error('Generate strong secrets with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
  } else {
    console.warn('⚠️  WARNING: Using weak JWT secrets in development mode');
    console.warn('⚠️  Generate strong secrets for production: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  }
}

// Generate access token (PRODUCTION-READY: includes session_id for revocation)
const generateAccessToken = (userId, email, role = 'user', sessionId = null) => {
  const payload = { 
    sub: userId,      // Standard JWT claim for subject
    userId,           // Keep for backward compatibility
    email, 
    role, 
    type: 'access',
    jti: uuidv4()     // JWT ID for token tracking
  };

  // Include session_id if provided (enables per-session revocation)
  if (sessionId) {
    payload.session_id = sessionId;
  }

  return jwt.sign(
    payload,
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn }
  );
};

// Generate refresh token (PRODUCTION-READY: includes session_id)
const generateRefreshToken = (userId, sessionId = null) => {
  const payload = {
    sub: userId,      // Standard JWT claim for subject
    userId,           // Keep for backward compatibility
    type: 'refresh',
    jti: uuidv4()     // JWT ID for token tracking
  };

  // Include session_id if provided (enables per-session revocation)
  if (sessionId) {
    payload.session_id = sessionId;
  }

  return jwt.sign(
    payload,
    jwtConfig.refreshToken.secret,
    { expiresIn: jwtConfig.refreshToken.expiresIn }
  );
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshToken.secret);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Security headers configuration
const securityHeaders = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com']
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Get allowed origins from environment variable
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map(o => o.trim());
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      // If so, reflect the origin in the CORS header
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With'
  ]
};

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Store in Redis for distributed systems
  // store: new RedisStore({ ... })
};

// Strict rate limit for auth endpoints
const authRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true
};

// Rate limit for analytics endpoints (prevent DDoS)
const analyticsRateLimitConfig = {
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 events per minute
  message: 'Too many analytics events, please slow down.',
  standardHeaders: true,
  legacyHeaders: false
};

// Rate limit for ML endpoints (expensive operations)
const mlRateLimitConfig = {
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute (ML operations are heavy)
  message: 'Too many ML requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false
};

// Rate limit for admin/user management (prevent abuse)
const adminRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 admin operations per 15 minutes
  message: 'Too many admin requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false
};

// Cookie configuration
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  signed: true
};

// Refresh token cookie config (longer expiry)
const refreshTokenCookieConfig = {
  ...cookieConfig,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth/refresh' // Only send with refresh requests
};

// Password configuration (IMPROVED: Following NIST/OWASP guidelines)
const passwordConfig = {
  minLength: 12, // Increased from 8 (NIST recommendation)
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true, // NOW REQUIRED (was false)
  specialCharsRegex: /[!@#$%^&*(),.?":{}|<>]/,
  bcryptRounds: 12
};

// Session configuration
const sessionConfig = {
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'sessionId' // Custom session cookie name
};

// Validate session secret
if (!sessionConfig.secret) {
  console.error('FATAL ERROR: COOKIE_SECRET not configured!');
  console.error('COOKIE_SECRET must be set in environment variables');
  process.exit(1);
}

// Warn if using weak cookie secret
const isWeakCookieSecret = weakSecrets.some(weak => sessionConfig.secret.includes(weak));
if (isWeakCookieSecret) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: Weak COOKIE_SECRET detected in PRODUCTION mode!');
    process.exit(1);
  } else {
    console.warn('⚠️  WARNING: Using weak COOKIE_SECRET in development mode');
  }
}

module.exports = {
  jwtConfig,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateCSRFToken,
  securityHeaders,
  corsOptions,
  rateLimitConfig,
  authRateLimitConfig,
  analyticsRateLimitConfig,
  mlRateLimitConfig,
  adminRateLimitConfig,
  cookieConfig,
  refreshTokenCookieConfig,
  passwordConfig,
  sessionConfig
};
