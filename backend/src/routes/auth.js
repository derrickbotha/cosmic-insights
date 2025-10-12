const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, validateRefreshToken } = require('../middleware/auth');
const { authRateLimitConfig } = require('../config/security');
const rateLimit = require('express-rate-limit');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation
} = require('../middleware/validation');

// Apply strict rate limiting to authentication routes
const authLimiter = rateLimit(authRateLimitConfig);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, registerValidation, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get tokens
 * @access  Public
 */
router.post('/login', authLimiter, loginValidation, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires refresh token in cookie)
 */
router.post('/refresh', validateRefreshToken, authController.refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', authLimiter, forgotPasswordValidation, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', authLimiter, resetPasswordValidation, authController.resetPassword);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification (requires email in body)
 * @access  Public
 */
router.post('/resend-verification', authLimiter, authController.resendVerification);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/profile', authenticate, updateProfileValidation, authController.updateProfile);

/**
 * @route   PATCH /api/auth/profile-image
 * @desc    Update user profile image
 * @access  Private
 */
router.patch('/profile-image', authenticate, authController.updateProfileImage);

module.exports = router;
