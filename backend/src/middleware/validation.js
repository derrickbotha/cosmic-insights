const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation failed:', { errors: errors.array(), path: req.path });
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Registration validation rules
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  validate
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Password reset request validation
 */
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  validate
];

/**
 * Password reset validation
 */
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  validate
];

/**
 * Profile update validation
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('astrology.sunSign')
    .optional()
    .isIn(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'])
    .withMessage('Invalid sun sign'),
  body('astrology.moonSign')
    .optional()
    .isIn(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'])
    .withMessage('Invalid moon sign'),
  body('astrology.risingSign')
    .optional()
    .isIn(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'])
    .withMessage('Invalid rising sign'),
  body('astrology.birthDate')
    .optional()
    .isISO8601()
    .withMessage('Birth date must be a valid date'),
  body('astrology.birthPlace')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Birth place must not exceed 100 characters'),
  validate
];

/**
 * Analytics event validation
 */
const analyticsEventValidation = [
  body('eventName')
    .trim()
    .notEmpty()
    .withMessage('Event name is required')
    .isLength({ max: 100 })
    .withMessage('Event name must not exceed 100 characters'),
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Invalid URL format'),
  body('deviceType')
    .optional()
    .isIn(['desktop', 'mobile', 'tablet', 'other'])
    .withMessage('Invalid device type'),
  validate
];

/**
 * Payment validation
 */
const paymentValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP'])
    .withMessage('Invalid currency'),
  body('tier')
    .isIn(['premium', 'pro'])
    .withMessage('Invalid subscription tier'),
  body('provider')
    .isIn(['stripe', 'braintree'])
    .withMessage('Invalid payment provider'),
  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method ID is required'),
  validate
];

/**
 * Subscription validation
 */
const subscriptionValidation = [
  body('tier')
    .isIn(['premium', 'pro'])
    .withMessage('Invalid subscription tier'),
  body('interval')
    .isIn(['month', 'year'])
    .withMessage('Invalid billing interval'),
  body('provider')
    .isIn(['stripe', 'braintree'])
    .withMessage('Invalid payment provider'),
  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method ID is required'),
  validate
];

/**
 * Pagination validation
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  validate
];

/**
 * Date range validation
 */
const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate(),
  validate
];

/**
 * MongoDB ID validation
 */
const mongoIdValidation = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  analyticsEventValidation,
  paymentValidation,
  subscriptionValidation,
  paginationValidation,
  dateRangeValidation,
  mongoIdValidation
};
