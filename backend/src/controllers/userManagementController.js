const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

/**
 * Get all users with pagination and filtering
 */
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
};

/**
 * Update user role
 */
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'admin', 'ml_engineer', 'analytics_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      });
    }

    // Prevent users from changing their own role
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    logger.info(`User ${req.user.id} changed role of user ${userId} to ${role}`);

    res.json({
      success: true,
      data: user,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
};

/**
 * Create ML admin user
 */
const createMLAdminUser = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and role are required'
      });
    }

    // Validate role and map ml_engineer to ml_admin for compatibility
    const roleMapping = {
      'ml_engineer': 'ml_admin',
      'ml_admin': 'ml_admin',
      'analytics_admin': 'analytics_admin',
      'admin': 'admin'
    };
    
    if (!roleMapping[role]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: ml_engineer, ml_admin, analytics_admin, admin'
      });
    }
    
    const mappedRole = roleMapping[role];

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || email.split('@')[0], // Name required at top level
      role: mappedRole, // Use mapped role
      tier: 'premium', // ML admins get premium tier
      profile: {
        isProfileComplete: !!name
      }
    });

    await user.save();

    logger.info(`ML admin user created: ${email} with role ${role} by ${req.user.email}`);

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'ML admin user created successfully'
    });
  } catch (error) {
    logger.error('Error creating ML admin user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create ML admin user'
    });
  }
};

/**
 * Get role statistics
 */
const getRoleStatistics = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleStats = {
      user: 0,
      admin: 0,
      ml_engineer: 0,
      analytics_admin: 0
    };

    stats.forEach(stat => {
      roleStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: roleStats
    });
  } catch (error) {
    logger.error('Error fetching role statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch role statistics'
    });
  }
};

/**
 * Delete user (soft delete - deactivate account)
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent users from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        deletedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    logger.info(`User ${userId} deactivated by ${req.user.email}`);

    res.json({
      success: true,
      data: user,
      message: 'User account deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  createMLAdminUser,
  getRoleStatistics,
  deleteUser
};
