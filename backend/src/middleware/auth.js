const { verifyAccessToken, verifyRefreshToken } = require('../config/security');
const User = require('../models/User');
const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

/**
 * Authentication middleware (PRODUCTION-READY: Validates session_id)
 * Verifies JWT token and attaches user to request
 * Now checks Redis session for revocation capability
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // NEW: Validate session if session_id is present (production mode)
    if (decoded.session_id) {
      const session = await sessionService.getSession(decoded.session_id);
      
      if (!session) {
        return res.status(401).json({
          success: false,
          error: 'Session has been revoked or expired'
        });
      }

      // Update last seen timestamp
      await sessionService.updateLastSeen(decoded.session_id);
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId || decoded.sub).select('+passwordChangedAt');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists'
      });
    }

    // Check if user is active
    if (!user.isActive || user.deletedAt) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated'
      });
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        error: 'Password recently changed. Please login again.'
      });
    }

    // Attach user to request (include session_id for session management)
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      tier: user.tier,
      sessionId: decoded.session_id || null // For session management endpoints
    };

    // Update last active
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

/**
 * Authorization middleware
 * Checks if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.userId} to ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

/**
 * Tier-based authorization
 * Checks if user has required subscription tier
 */
const requireTier = (...tiers) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!tiers.includes(req.user.tier)) {
      return res.status(403).json({
        success: false,
        error: `This feature requires ${tiers.join(' or ')} subscription`,
        requiredTiers: tiers,
        currentTier: req.user.tier
      });
    }

    next();
  };
};

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive && !user.deletedAt) {
        req.user = {
          userId: user._id,
          email: user.email,
          role: user.role,
          tier: user.tier
        };
      }
    }
  } catch (error) {
    // Silently fail - user remains unauthenticated
  }
  
  next();
};

/**
 * CSRF protection middleware
 * Verifies CSRF token for state-changing operations
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.cookies.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    logger.warn(`CSRF token mismatch from IP ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
  }

  next();
};

/**
 * Refresh token middleware
 * Validates refresh token from cookie
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token provided'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    // Check if user exists
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists'
      });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(
      rt => rt.token === refreshToken && rt.expiresAt > new Date()
    );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      tier: user.tier
    };
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    logger.error('Refresh token validation error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
};

/**
 * Check if user has any admin role
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }

  const adminRoles = ['admin', 'ml_admin', 'analytics_admin'];
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

/**
 * Check if user has ML admin permissions
 */
const requireMLAdmin = authorize('admin', 'ml_admin');

/**
 * Check if user has analytics admin permissions
 */
const requireAnalyticsAdmin = authorize('admin', 'analytics_admin');

/**
 * Helper function to check if a role is an admin role
 * @param {string} role - User role to check
 * @returns {boolean} - True if role is admin, ml_admin, or analytics_admin
 */
const isAdminRole = (role) => {
  const adminRoles = ['admin', 'ml_admin', 'analytics_admin'];
  return adminRoles.includes(role);
};

module.exports = {
  authenticate,
  authorize,
  requireTier,
  optionalAuth,
  csrfProtection,
  validateRefreshToken,
  isAdmin,
  requireMLAdmin,
  requireAnalyticsAdmin,
  isAdminRole
};
