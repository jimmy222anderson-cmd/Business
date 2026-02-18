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

/**
 * Validation rules for creating satellite product
 */
const validateCreateSatelliteProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
  body('provider')
    .trim()
    .notEmpty()
    .withMessage('Provider is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Provider must be between 1 and 200 characters'),
  body('sensor_type')
    .trim()
    .notEmpty()
    .withMessage('Sensor type is required')
    .isIn(['optical', 'radar', 'thermal'])
    .withMessage('Sensor type must be one of: optical, radar, thermal'),
  body('resolution')
    .notEmpty()
    .withMessage('Resolution is required')
    .isFloat({ min: 0 })
    .withMessage('Resolution must be a positive number'),
  body('resolution_category')
    .trim()
    .notEmpty()
    .withMessage('Resolution category is required')
    .isIn(['vhr', 'high', 'medium', 'low'])
    .withMessage('Resolution category must be one of: vhr, high, medium, low'),
  body('bands')
    .notEmpty()
    .withMessage('Bands are required')
    .isArray({ min: 1 })
    .withMessage('At least one band must be specified'),
  body('bands.*')
    .trim()
    .notEmpty()
    .withMessage('Band name cannot be empty'),
  body('coverage')
    .trim()
    .notEmpty()
    .withMessage('Coverage is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Coverage must be between 1 and 200 characters'),
  body('availability')
    .trim()
    .notEmpty()
    .withMessage('Availability is required')
    .isIn(['archive', 'tasking', 'both'])
    .withMessage('Availability must be one of: archive, tasking, both'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters'),
  body('sample_image_url')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Sample image URL must not exceed 500 characters'),
  body('specifications.swath_width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Swath width must be a positive number'),
  body('specifications.revisit_time')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Revisit time must be a positive number'),
  body('specifications.spectral_bands')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Spectral bands must be a positive integer'),
  body('specifications.radiometric_resolution')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Radiometric resolution must be a positive integer'),
  body('pricing_info')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Pricing info must not exceed 500 characters'),
  body('status')
    .optional()
    .trim()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  body('order')
    .optional()
    .isInt()
    .withMessage('Order must be an integer'),
  handleValidationErrors
];

/**
 * Validation rules for updating satellite product
 */
const validateUpdateSatelliteProduct = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
  body('provider')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Provider cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Provider must be between 1 and 200 characters'),
  body('sensor_type')
    .optional()
    .trim()
    .isIn(['optical', 'radar', 'thermal'])
    .withMessage('Sensor type must be one of: optical, radar, thermal'),
  body('resolution')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Resolution must be a positive number'),
  body('resolution_category')
    .optional()
    .trim()
    .isIn(['vhr', 'high', 'medium', 'low'])
    .withMessage('Resolution category must be one of: vhr, high, medium, low'),
  body('bands')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one band must be specified'),
  body('bands.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Band name cannot be empty'),
  body('coverage')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Coverage cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Coverage must be between 1 and 200 characters'),
  body('availability')
    .optional()
    .trim()
    .isIn(['archive', 'tasking', 'both'])
    .withMessage('Availability must be one of: archive, tasking, both'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters'),
  body('sample_image_url')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Sample image URL must not exceed 500 characters'),
  body('specifications.swath_width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Swath width must be a positive number'),
  body('specifications.revisit_time')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Revisit time must be a positive number'),
  body('specifications.spectral_bands')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Spectral bands must be a positive integer'),
  body('specifications.radiometric_resolution')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Radiometric resolution must be a positive integer'),
  body('pricing_info')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Pricing info must not exceed 500 characters'),
  body('status')
    .optional()
    .trim()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  body('order')
    .optional()
    .isInt()
    .withMessage('Order must be an integer'),
  handleValidationErrors
];

/**
 * Validation rules for imagery request
 */
const validateImageryRequest = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must not exceed 200 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('aoi_type')
    .trim()
    .notEmpty()
    .withMessage('AOI type is required')
    .isIn(['polygon', 'rectangle', 'circle'])
    .withMessage('AOI type must be one of: polygon, rectangle, circle'),
  body('aoi_coordinates')
    .notEmpty()
    .withMessage('AOI coordinates are required')
    .custom((value) => {
      if (!value || typeof value !== 'object') {
        throw new Error('AOI coordinates must be a valid GeoJSON object');
      }
      if (!value.type || !value.coordinates) {
        throw new Error('AOI coordinates must have type and coordinates properties');
      }
      if (!['Polygon', 'Point'].includes(value.type)) {
        throw new Error('AOI coordinates type must be Polygon or Point');
      }
      return true;
    }),
  body('aoi_area_km2')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('AOI area must be a positive number'),
  body('aoi_center')
    .notEmpty()
    .withMessage('AOI center is required')
    .custom((value) => {
      if (!value || typeof value !== 'object') {
        throw new Error('AOI center must be an object');
      }
      if (typeof value.lat !== 'number' || typeof value.lng !== 'number') {
        throw new Error('AOI center must have lat and lng as numbers');
      }
      if (value.lat < -90 || value.lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      if (value.lng < -180 || value.lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      return true;
    }),
  body('date_range')
    .notEmpty()
    .withMessage('Date range is required')
    .custom((value) => {
      if (!value || typeof value !== 'object') {
        throw new Error('Date range must be an object');
      }
      if (!value.start_date || !value.end_date) {
        throw new Error('Date range must have start_date and end_date');
      }
      const startDate = new Date(value.start_date);
      const endDate = new Date(value.end_date);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }
      if (endDate < startDate) {
        throw new Error('End date must be after or equal to start date');
      }
      return true;
    }),
  body('filters')
    .optional()
    .custom((value) => {
      if (value && typeof value !== 'object') {
        throw new Error('Filters must be an object');
      }
      if (value && value.resolution_category) {
        if (!Array.isArray(value.resolution_category)) {
          throw new Error('Resolution category must be an array');
        }
        const validCategories = ['vhr', 'high', 'medium', 'low'];
        if (!value.resolution_category.every(cat => validCategories.includes(cat))) {
          throw new Error('Invalid resolution category');
        }
      }
      if (value && value.max_cloud_coverage !== undefined) {
        if (typeof value.max_cloud_coverage !== 'number' || 
            value.max_cloud_coverage < 0 || 
            value.max_cloud_coverage > 100) {
          throw new Error('Max cloud coverage must be between 0 and 100');
        }
      }
      if (value && value.image_types) {
        if (!Array.isArray(value.image_types)) {
          throw new Error('Image types must be an array');
        }
        const validTypes = ['optical', 'radar', 'thermal'];
        if (!value.image_types.every(type => validTypes.includes(type))) {
          throw new Error('Invalid image type');
        }
      }
      return true;
    }),
  body('urgency')
    .optional()
    .trim()
    .isIn(['standard', 'urgent', 'emergency'])
    .withMessage('Urgency must be one of: standard, urgent, emergency'),
  body('additional_requirements')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Additional requirements must not exceed 5000 characters'),
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
  validateObjectId,
  validateCreateSatelliteProduct,
  validateUpdateSatelliteProduct,
  validateImageryRequest
};
