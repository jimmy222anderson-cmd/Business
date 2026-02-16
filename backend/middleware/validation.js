const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation error',
      details: errors.array().reduce((acc, err) => {
        acc[err.path] = err.msg;
        return acc;
      }, {})
    });
  }
  next();
};

/**
 * Validation rules for user signup
 */
const validateSignup = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters')
    .escape(),
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must not exceed 200 characters')
    .escape(),
  handleValidationErrors
];

/**
 * Validation rules for user signin
 */
const validateSignin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .escape(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for forgot password
 */
const validateForgotPassword = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .escape(),
  handleValidationErrors
];

/**
 * Validation rules for reset password
 */
const validateResetPassword = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required')
    .escape(),
  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  handleValidationErrors
];

/**
 * Validation rules for demo booking
 */
const validateDemoBooking = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .escape(),
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must not exceed 200 characters')
    .escape(),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Please provide a valid phone number')
    .escape(),
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Job title must not exceed 100 characters')
    .escape(),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Message must not exceed 2000 characters')
    .escape(),
  handleValidationErrors
];

/**
 * Validation rules for contact inquiry
 */
const validateContactInquiry = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .escape(),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must not exceed 200 characters')
    .escape(),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters')
    .escape(),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters')
    .escape(),
  handleValidationErrors
];

/**
 * Validation rules for quote request
 */
const validateQuoteRequest = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .escape(),
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Company name must be between 1 and 200 characters')
    .escape(),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Please provide a valid phone number')
    .escape(),
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required')
    .isIn([
      'Financial Services',
      'Agriculture',
      'Energy',
      'Mining',
      'Construction',
      'Government',
      'Environment',
      'Insurance',
      'Other'
    ])
    .withMessage('Please select a valid industry')
    .escape(),
  body('estimatedDataVolume')
    .trim()
    .notEmpty()
    .withMessage('Estimated data volume is required')
    .isIn([
      '< 1 TB/month',
      '1-10 TB/month',
      '10-50 TB/month',
      '50-100 TB/month',
      '> 100 TB/month',
      'Not sure'
    ])
    .withMessage('Please select a valid data volume range')
    .escape(),
  body('requirements')
    .trim()
    .notEmpty()
    .withMessage('Requirements description is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Requirements must be between 1 and 5000 characters')
    .escape(),
  handleValidationErrors
];

/**
 * Validation rules for MongoDB ObjectId
 */
const validateObjectId = [
  param('id')
    .trim()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateSignup,
  validateSignin,
  validateForgotPassword,
  validateResetPassword,
  validateDemoBooking,
  validateContactInquiry,
  validateQuoteRequest,
  validateObjectId
};
