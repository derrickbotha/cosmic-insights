const crypto = require('crypto');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, generateCSRFToken } = require('../config/security');
const { refreshTokenCookieConfig, cookieConfig } = require('../config/security');
const logger = require('../utils/logger');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../config/email');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name, username, profileImage } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUsername = await User.findOne({ username: username.toLowerCase() });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
      }
    }

    // Generate default username from email if not provided
    const finalUsername = username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      username: finalUsername,
      profileImage: profileImage || null,
      role: 'user',
      tier: 'free'
    });

    // Generate email verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      logger.info(`Verification email sent to ${user.email}`);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Continue even if email fails
    }

    logger.logAuth('user_registered', user._id, { email, name, username: finalUsername });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        error: `Account is locked. Please try again in ${lockTimeRemaining} minutes.`
      });
    }

    // Check if account is active
    if (!user.isActive || user.deletedAt) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        emailVerificationRequired: true
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      logger.logAuth('login_failed', user._id, { 
        email, 
        reason: 'invalid_password',
        attempts: user.loginAttempts + 1
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Calculate refresh token expiry (7 days)
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save refresh token to database
    await user.addRefreshToken(refreshToken, refreshTokenExpiry);

    // Generate CSRF token
    const csrfToken = generateCSRFToken();

    // Update last login
    user.lastLogin = new Date();
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    // Set tokens in cookies
    res.cookie('refreshToken', refreshToken, {
      ...refreshTokenCookieConfig,
      secure: process.env.NODE_ENV === 'production'
    });

    res.cookie('csrfToken', csrfToken, {
      ...cookieConfig,
      secure: process.env.NODE_ENV === 'production'
    });

    logger.logAuth('login_success', user._id, { email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        csrfToken,
        user: {
          userId: user._id,
          email: user.email,
          name: user.name,
          username: user.username,
          profileImage: user.profileImage,
          role: user.role,
          tier: user.tier,
          emailVerified: user.emailVerified,
          subscriptionStatus: user.subscriptionStatus
        }
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove refresh token from database
      const user = await User.findById(req.user.userId);
      if (user) {
        await user.removeRefreshToken(refreshToken);
      }
    }

    // Clear cookies
    res.clearCookie('refreshToken');
    res.clearCookie('csrfToken');

    logger.logAuth('logout', req.user.userId, { email: req.user.email });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Logout failed. Please try again.'
    });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public (requires refresh token)
 */
exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    // Remove old refresh token
    await user.removeRefreshToken(req.refreshToken);

    // Generate new tokens
    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save new refresh token
    await user.addRefreshToken(newRefreshToken, refreshTokenExpiry);

    // Generate new CSRF token
    const csrfToken = generateCSRFToken();

    // Set new tokens in cookies
    res.cookie('refreshToken', newRefreshToken, {
      ...refreshTokenCookieConfig,
      secure: process.env.NODE_ENV === 'production'
    });

    res.cookie('csrfToken', csrfToken, {
      ...cookieConfig,
      secure: process.env.NODE_ENV === 'production'
    });

    logger.logAuth('token_refreshed', user._id, { email: user.email });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        csrfToken
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed. Please login again.'
    });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send password reset email
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    logger.logAuth('password_reset_requested', user._id, { email });

    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Password reset request failed. Please try again.'
    });
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password
 * @access Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash the token from URL to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Set new password (will be hashed by pre-save middleware)
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    // Clean up all refresh tokens (force re-login)
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });

    logger.logAuth('password_reset_success', user._id, { email: user.email });

    res.json({
      success: true,
      message: 'Password has been reset successfully. Please login with your new password.'
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Password reset failed. Please try again.'
    });
  }
};

/**
 * Verify email address
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public (requires email)
 */
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a verification link.'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      logger.info(`Verification email resent to ${user.email}`);
    } catch (emailError) {
      logger.error('Failed to resend verification email:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again later.'
      });
    }

    logger.logAuth('verification_email_resent', user._id, { email: user.email });

    res.json({
      success: true,
      message: 'Verification email has been sent. Please check your inbox.'
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email. Please try again.'
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        tier: user.tier,
        emailVerified: user.emailVerified,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
        astrology: user.astrology,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
};

/**
 * Update user profile
 * @route PATCH /api/auth/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'astrology', 'preferences'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    logger.logAuth('profile_updated', user._id, { 
      email: user.email,
      updatedFields: Object.keys(updates)
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        astrology: user.astrology,
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Profile update failed. Please try again.'
    });
  }
};

/**
 * Verify email address
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
      // Continue even if email fails
    }

    logger.logAuth('email_verified', user._id, { email: user.email });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.',
      data: {
        userId: user._id,
        email: user.email,
        emailVerified: true
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Email verification failed. Please try again.'
    });
  }
};

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 */
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again later.'
      });
    }

    logger.info(`Verification email resent to ${user.email}`);

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email. Please try again.'
    });
  }
};

/**
 * Update profile image
 * @route PATCH /api/auth/profile-image
 * @access Private
 */
exports.updateProfileImage = async (req, res) => {
  try {
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({
        success: false,
        error: 'Profile image URL is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { profileImage } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    logger.logAuth('profile_image_updated', user._id, { email: user.email });

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        userId: user._id,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile image. Please try again.'
    });
  }
};
