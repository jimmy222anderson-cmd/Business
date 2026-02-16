/**
 * Email Helper Module
 * 
 * This module provides a unified interface for sending emails.
 * It automatically uses the email queue if available, or falls back to direct sending.
 * 
 * Usage:
 *   const { sendWelcomeEmail } = require('./services/emailHelper');
 *   await sendWelcomeEmail('user@example.com', 'John Doe');
 */

const emailService = require('./email');

// Try to load email queue (optional dependency)
let emailQueue;
try {
  emailQueue = require('../queues/emailQueue');
  console.log('✅ Email queue enabled');
} catch (error) {
  console.log('ℹ️  Email queue not available, using direct email sending');
  emailQueue = null;
}

// Check if queue should be used
const USE_QUEUE = process.env.USE_EMAIL_QUEUE === 'true' && emailQueue !== null;

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>}
 */
async function sendWelcomeEmail(email, name) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('welcome', { email, name });
  }
  return await emailService.sendWelcomeEmail(email, name);
}

/**
 * Send email verification
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} verificationToken - Verification token
 * @returns {Promise<Object>}
 */
async function sendEmailVerification(email, name, verificationToken) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('emailVerification', { email, name, verificationToken });
  }
  return await emailService.sendEmailVerification(email, name, verificationToken);
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} resetToken - Reset token
 * @returns {Promise<Object>}
 */
async function sendPasswordResetEmail(email, name, resetToken) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('passwordReset', { email, name, resetToken });
  }
  return await emailService.sendPasswordResetEmail(email, name, resetToken);
}

/**
 * Send password changed email
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>}
 */
async function sendPasswordChangedEmail(email, name) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('passwordChanged', { email, name });
  }
  return await emailService.sendPasswordChangedEmail(email, name);
}

/**
 * Send demo booking confirmation
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>}
 */
async function sendDemoConfirmation(email, name, bookingId) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('demoConfirmation', { email, name, bookingId });
  }
  return await emailService.sendDemoConfirmation(email, name, bookingId);
}

/**
 * Send demo booking notification to sales team
 * @param {Object} booking - Booking object
 * @returns {Promise<Object>}
 */
async function sendDemoNotification(booking) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('demoNotification', { booking });
  }
  return await emailService.sendDemoNotification(booking);
}

/**
 * Send contact inquiry confirmation
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>}
 */
async function sendContactConfirmation(email, name) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('contactConfirmation', { email, name });
  }
  return await emailService.sendContactConfirmation(email, name);
}

/**
 * Send contact inquiry notification to support team
 * @param {Object} inquiry - Inquiry object
 * @returns {Promise<Object>}
 */
async function sendContactNotification(inquiry) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('contactNotification', { inquiry });
  }
  return await emailService.sendContactNotification(inquiry);
}

/**
 * Send quote request confirmation
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} quoteRequestId - Quote request ID
 * @returns {Promise<Object>}
 */
async function sendQuoteRequestConfirmation(email, name, quoteRequestId) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('quoteRequestConfirmation', { email, name, quoteRequestId });
  }
  return await emailService.sendQuoteRequestConfirmation(email, name, quoteRequestId);
}

/**
 * Send quote request notification to sales team
 * @param {Object} quoteRequest - Quote request object
 * @returns {Promise<Object>}
 */
async function sendQuoteRequestNotification(quoteRequest) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('quoteRequestNotification', { quoteRequest });
  }
  return await emailService.sendQuoteRequestNotification(quoteRequest);
}

/**
 * Send quote email to customer
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {Object} quoteDetails - Quote details
 * @returns {Promise<Object>}
 */
async function sendQuoteEmail(email, name, quoteDetails) {
  if (USE_QUEUE) {
    return await emailQueue.addEmailToQueue('quote', { email, name, quoteDetails });
  }
  return await emailService.sendQuoteEmail(email, name, quoteDetails);
}

module.exports = {
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendDemoConfirmation,
  sendDemoNotification,
  sendContactConfirmation,
  sendContactNotification,
  sendQuoteRequestConfirmation,
  sendQuoteRequestNotification,
  sendQuoteEmail,
  USE_QUEUE
};
