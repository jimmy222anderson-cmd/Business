const crypto = require('crypto');

/**
 * Generate a secure random token for password reset
 * @returns {string} A 32-byte hex string (64 characters)
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a secure random token for email verification
 * @returns {string} A 32-byte hex string (64 characters)
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a token expiration date (1 hour from now)
 * @returns {Date} Expiration date
 */
function generateTokenExpiration(hours = 1) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

module.exports = {
  generateResetToken,
  generateVerificationToken,
  generateTokenExpiration
};
