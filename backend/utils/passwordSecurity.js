const bcrypt = require('bcrypt');

/**
 * Password security configuration
 */
const PASSWORD_CONFIG = {
  SALT_ROUNDS: 10,
  MIN_LENGTH: 8,
  HISTORY_SIZE: 5, // Number of previous passwords to remember
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: false
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < PASSWORD_CONFIG.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long`);
  }

  if (PASSWORD_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_CONFIG.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_CONFIG.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, PASSWORD_CONFIG.SALT_ROUNDS);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Check if password was used recently
 * @param {string} password - Plain text password
 * @param {string[]} passwordHistory - Array of previous password hashes
 * @returns {Promise<boolean>} - True if password was used recently
 */
async function isPasswordReused(password, passwordHistory) {
  if (!passwordHistory || passwordHistory.length === 0) {
    return false;
  }

  // Check against all passwords in history
  for (const oldHash of passwordHistory) {
    const isMatch = await comparePassword(password, oldHash);
    if (isMatch) {
      return true;
    }
  }

  return false;
}

/**
 * Update password history
 * @param {string} newPasswordHash - New password hash to add
 * @param {string[]} currentHistory - Current password history
 * @returns {string[]} - Updated password history
 */
function updatePasswordHistory(newPasswordHash, currentHistory = []) {
  // Add new password hash to the beginning
  const updatedHistory = [newPasswordHash, ...currentHistory];
  
  // Keep only the last N passwords
  return updatedHistory.slice(0, PASSWORD_CONFIG.HISTORY_SIZE);
}

/**
 * Sanitize password from logs
 * Never log passwords in plain text
 * @param {Object} data - Data object that might contain password
 * @returns {Object} - Sanitized data object
 */
function sanitizePasswordFromLogs(data) {
  const sanitized = { ...data };
  
  // Remove password fields
  const passwordFields = ['password', 'newPassword', 'oldPassword', 'confirmPassword'];
  passwordFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

module.exports = {
  PASSWORD_CONFIG,
  validatePasswordStrength,
  hashPassword,
  comparePassword,
  isPasswordReused,
  updatePasswordHistory,
  sanitizePasswordFromLogs
};
