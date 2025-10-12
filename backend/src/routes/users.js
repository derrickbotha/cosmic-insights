const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const { authenticate } = require('../middleware/auth');
const { isAdminRole } = require('../middleware/auth');

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
router.get('/', authenticate, requireAdminRole, userManagementController.getAllUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get role statistics
 * @access  Admin, ML Engineer, Analytics Admin
 */
router.get('/stats', authenticate, requireAdminRole, userManagementController.getRoleStatistics);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Admin, ML Engineer, Analytics Admin
 */
router.get('/:userId', authenticate, requireAdminRole, userManagementController.getUserById);

/**
 * @route   POST /api/users/create-admin
 * @desc    Create ML admin user (ml_engineer or analytics_admin)
 * @access  Admin only
 */
router.post('/create-admin', authenticate, requireAdminRole, userManagementController.createMLAdminUser);

/**
 * @route   PUT /api/users/:userId/role
 * @desc    Update user role
 * @access  Admin only
 */
router.put('/:userId/role', authenticate, requireAdminRole, userManagementController.updateUserRole);

/**
 * @route   DELETE /api/users/:userId
 * @desc    Deactivate user account
 * @access  Admin only
 */
router.delete('/:userId', authenticate, requireAdminRole, userManagementController.deleteUser);

module.exports = router;
