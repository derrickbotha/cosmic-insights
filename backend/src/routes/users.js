const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const userManagementController = require('../controllers/userManagementController');
const { authenticate } = require('../middleware/auth');
const { isAdminRole } = require('../middleware/auth');
const { adminRateLimitConfig } = require('../config/security');
const { mongoIdValidation } = require('../middleware/validation');

// Apply rate limiting to admin routes
const adminLimiter = rateLimit(adminRateLimitConfig);

// Middleware to check if user has admin privileges
const requireAdminRole = (req, res, next) => {
  if (!isAdminRole(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  Admin, ML Engineer, Analytics Admin
 */
router.get('/', adminLimiter, authenticate, requireAdminRole, userManagementController.getAllUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get role statistics
 * @access  Admin, ML Engineer, Analytics Admin
 */
router.get('/stats', adminLimiter, authenticate, requireAdminRole, userManagementController.getRoleStatistics);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Admin, ML Engineer, Analytics Admin
 */
router.get('/:userId', adminLimiter, authenticate, mongoIdValidation('userId'), requireAdminRole, userManagementController.getUserById);

/**
 * @route   POST /api/users/create-admin
 * @desc    Create ML admin user (ml_engineer or analytics_admin)
 * @access  Admin only
 */
router.post('/create-admin', adminLimiter, authenticate, requireAdminRole, userManagementController.createMLAdminUser);

/**
 * @route   PUT /api/users/:userId/role
 * @desc    Update user role
 * @access  Admin only
 */
router.put('/:userId/role', adminLimiter, authenticate, mongoIdValidation('userId'), requireAdminRole, userManagementController.updateUserRole);

/**
 * @route   DELETE /api/users/:userId
 * @desc    Deactivate user account
 * @access  Admin only
 */
router.delete('/:userId', adminLimiter, authenticate, mongoIdValidation('userId'), requireAdminRole, userManagementController.deleteUser);

module.exports = router;
