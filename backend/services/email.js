const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create transporter based on email service configuration
let transporter;
let resendClient;

if (process.env.EMAIL_SERVICE === 'resend') {
  // Resend configuration
  const { Resend } = require('resend');
  resendClient = new Resend(process.env.EMAIL_API_KEY);
  console.log('Email service: Resend configured');
} else if (process.env.EMAIL_SERVICE === 'sendgrid') {
  // SendGrid configuration
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.EMAIL_API_KEY
    }
  });
  console.log('Email service: SendGrid configured');
} else {
  // Default SMTP configuration (for development/testing)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });
  console.log('Email service: SMTP configured');
}

/**
 * Load and populate email template
 * @param {string} templateName - Template file name
 * @param {Object} variables - Variables to replace in template
 * @returns {string} - Populated HTML template
 */
function loadTemplate(templateName, variables) {
  try {
    const templatePath = path.join(__dirname, '../templates', templateName);
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace all variables in template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, variables[key] || '');
    });
    
    return template;
  } catch (error) {
    console.error('Error loading template:', error);
    return null;
  }
}

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} - Email send result
 */
async function sendEmail({ to, subject, text, html }) {
  try {
    // Use Resend if configured
    if (process.env.EMAIL_SERVICE === 'resend' && resendClient) {
      const result = await resendClient.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: to,
        subject: subject,
        html: html || text,
        text: text
      });
      
      console.log('Email sent via Resend - Full response:', JSON.stringify(result, null, 2));
      return { id: result.data?.id || result.id, ...result };
    }
    
    // Use SMTP/SendGrid via nodemailer
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@earthintelligence.com',
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    
    // For development, log preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>}
 */
async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to Earth Intelligence Platform';
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = loadTemplate('welcomeEmail.html', {
    fullName: name,
    dashboardLink: `${frontendUrl}/dashboard`,
    productsLink: `${frontendUrl}/products`,
    pricingLink: `${frontendUrl}/pricing`,
    supportLink: `${frontendUrl}/contact`,
    twitterLink: 'https://twitter.com/earthintelligence',
    linkedinLink: 'https://linkedin.com/company/earthintelligence',
    githubLink: 'https://github.com/earthintelligence'
  });
  
  const text = `Welcome to Earth Intelligence Platform! Hi ${name}, Thank you for joining Earth Intelligence Platform. We're excited to have you on board!`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send demo booking confirmation email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>}
 */
async function sendDemoConfirmation(email, name, bookingId) {
  const subject = 'Demo Booking Confirmation - Earth Intelligence Platform';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Demo Booking Confirmed</h1>
      <p>Hi ${name},</p>
      <p>Your demo request has been successfully submitted!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Booking ID:</strong> ${bookingId}</p>
      </div>
      <p>Our team will reach out to you shortly to schedule your demo and provide meeting details.</p>
      <p>If you have any questions, please contact us at support@earthintelligence.com</p>
      <p>Best regards,<br>The Earth Intelligence Team</p>
    </div>
  `;
  const text = `Demo Booking Confirmed. Hi ${name}, Your demo request has been successfully submitted! Booking ID: ${bookingId}. Our team will reach out to you shortly.`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send demo booking notification to sales team
 * @param {Object} booking - Booking object
 * @returns {Promise<Object>}
 */
async function sendDemoNotification(booking) {
  const salesEmail = process.env.SALES_EMAIL || 'sales@earthintelligence.com';
  const subject = 'New Demo Booking Request';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">New Demo Booking Request</h1>
      <p>A new demo booking has been submitted:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Name:</strong> ${booking.fullName}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Company:</strong> ${booking.companyName || 'N/A'}</p>
        <p><strong>Phone:</strong> ${booking.phoneNumber || 'N/A'}</p>
        <p><strong>Job Title:</strong> ${booking.jobTitle || 'N/A'}</p>
        <p><strong>Message:</strong> ${booking.message || 'N/A'}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
        <p><strong>Created:</strong> ${new Date(booking.created_at).toLocaleString()}</p>
      </div>
      <p>Please follow up with the customer to schedule their demo.</p>
    </div>
  `;
  const text = `New Demo Booking Request. Booking ID: ${booking._id}, Name: ${booking.fullName}, Email: ${booking.email}, Company: ${booking.companyName || 'N/A'}`;

  return sendEmail({ to: salesEmail, subject, text, html });
}

/**
 * Send contact inquiry confirmation email
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>}
 */
async function sendContactConfirmation(email, name) {
  const subject = 'We Received Your Message - Earth Intelligence Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Thank You for Contacting Us</h1>
      <p>Hi ${name},</p>
      <p>We've received your message and our team will get back to you within 24-48 hours.</p>
      <p>In the meantime, feel free to explore our platform and learn more about our services.</p>
      <p>Best regards,<br>The Earth Intelligence Team</p>
    </div>
  `;
  const text = `Thank You for Contacting Us. Hi ${name}, We've received your message and our team will get back to you within 24-48 hours.`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send contact inquiry notification to support team
 * @param {Object} inquiry - Contact inquiry object
 * @returns {Promise<Object>}
 */
async function sendContactNotification(inquiry) {
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@earthintelligence.com';
  const subject = 'New Contact Inquiry';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">New Contact Inquiry</h1>
      <p>A new contact inquiry has been submitted:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Inquiry ID:</strong> ${inquiry._id}</p>
        <p><strong>Type:</strong> ${inquiry.inquiry_type}</p>
        <p><strong>Name:</strong> ${inquiry.full_name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Company:</strong> ${inquiry.company || 'N/A'}</p>
        <p><strong>Subject:</strong> ${inquiry.subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${inquiry.message}</p>
        <p><strong>Status:</strong> ${inquiry.status}</p>
        <p><strong>Created:</strong> ${new Date(inquiry.created_at).toLocaleString()}</p>
      </div>
      <p>Please follow up with the customer within 24-48 hours.</p>
    </div>
  `;
  const text = `New Contact Inquiry. Inquiry ID: ${inquiry._id}, Type: ${inquiry.inquiry_type}, Name: ${inquiry.full_name}, Email: ${inquiry.email}, Subject: ${inquiry.subject}`;

  return sendEmail({ to: supportEmail, subject, text, html });
}

/**
 * Send quote request confirmation email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} quoteRequestId - Quote request ID
 * @returns {Promise<Object>}
 */
async function sendQuoteRequestConfirmation(email, name, quoteRequestId) {
  const subject = 'Quote Request Received - Earth Intelligence Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Quote Request Received</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in Earth Intelligence Platform! We've received your quote request.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Request ID:</strong> ${quoteRequestId}</p>
      </div>
      <p>Our sales team will review your requirements and get back to you with a customized quote within 1-2 business days.</p>
      <p>In the meantime, feel free to explore our products and services on our website.</p>
      <p>If you have any urgent questions, please contact us at sales@earthintelligence.com</p>
      <p>Best regards,<br>The Earth Intelligence Team</p>
    </div>
  `;
  const text = `Quote Request Received. Hi ${name}, We've received your quote request (ID: ${quoteRequestId}). Our sales team will get back to you within 1-2 business days.`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send quote request notification to sales team
 * @param {Object} quoteRequest - Quote request object
 * @returns {Promise<Object>}
 */
async function sendQuoteRequestNotification(quoteRequest) {
  const salesEmail = process.env.SALES_EMAIL || 'sales@earthintelligence.com';
  const subject = 'New Quote Request';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">New Quote Request</h1>
      <p>A new quote request has been submitted:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Request ID:</strong> ${quoteRequest._id}</p>
        <p><strong>Name:</strong> ${quoteRequest.fullName}</p>
        <p><strong>Email:</strong> ${quoteRequest.email}</p>
        <p><strong>Company:</strong> ${quoteRequest.companyName}</p>
        <p><strong>Phone:</strong> ${quoteRequest.phoneNumber}</p>
        <p><strong>Industry:</strong> ${quoteRequest.industry}</p>
        <p><strong>Estimated Data Volume:</strong> ${quoteRequest.estimatedDataVolume}</p>
        <p><strong>Requirements:</strong></p>
        <p style="white-space: pre-wrap;">${quoteRequest.requirements}</p>
        <p><strong>Status:</strong> ${quoteRequest.status}</p>
        <p><strong>Created:</strong> ${new Date(quoteRequest.created_at).toLocaleString()}</p>
      </div>
      <p>Please review the requirements and prepare a customized quote for the customer.</p>
    </div>
  `;
  const text = `New Quote Request. Request ID: ${quoteRequest._id}, Name: ${quoteRequest.fullName}, Email: ${quoteRequest.email}, Company: ${quoteRequest.companyName}, Industry: ${quoteRequest.industry}`;

  return sendEmail({ to: salesEmail, subject, text, html });
}

/**
 * Send quote email to customer
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {Object} quoteDetails - Quote details (pricing, terms, validUntil)
 * @returns {Promise<Object>}
 */
async function sendQuoteEmail(email, name, quoteDetails) {
  const subject = 'Your Custom Quote - Earth Intelligence Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Your Custom Quote</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in Earth Intelligence Platform. We're pleased to provide you with a customized quote based on your requirements.</p>
      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #065f46;">Quote Details</h2>
        <p><strong>Pricing:</strong></p>
        <p style="white-space: pre-wrap;">${quoteDetails.pricing}</p>
        <p><strong>Terms:</strong></p>
        <p style="white-space: pre-wrap;">${quoteDetails.terms}</p>
        <p><strong>Valid Until:</strong> ${new Date(quoteDetails.validUntil).toLocaleDateString()}</p>
      </div>
      <p>This quote is valid until ${new Date(quoteDetails.validUntil).toLocaleDateString()}. If you have any questions or would like to proceed, please reply to this email or contact our sales team.</p>
      <p>We look forward to working with you!</p>
      <p>Best regards,<br>The Earth Intelligence Sales Team</p>
    </div>
  `;
  const text = `Your Custom Quote. Hi ${name}, We're pleased to provide you with a customized quote. Pricing: ${quoteDetails.pricing}. Valid until: ${new Date(quoteDetails.validUntil).toLocaleDateString()}`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>}
 */
async function sendPasswordResetEmail(email, name, resetToken) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request - Earth Intelligence Platform';
  
  const html = loadTemplate('passwordReset.html', {
    fullName: name,
    resetLink: resetUrl,
    supportLink: `${frontendUrl}/contact`
  });
  
  const text = `Password Reset Request. Click this link to reset your password: ${resetUrl}. This link will expire in 1 hour.`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send email verification email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} verificationToken - Email verification token
 * @returns {Promise<Object>}
 */
async function sendEmailVerification(email, name, verificationToken) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;
  const subject = 'Verify Your Email - Earth Intelligence Platform';
  
  const html = loadTemplate('emailVerification.html', {
    fullName: name,
    verificationLink: verificationUrl,
    supportLink: `${frontendUrl}/contact`
  });
  
  const text = `Verify Your Email. Hello ${name}, Thank you for signing up! Please verify your email by clicking this link: ${verificationUrl}`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send password changed confirmation email
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>}
 */
async function sendPasswordChangedEmail(email, name) {
  const subject = 'Password Changed Successfully - Earth Intelligence Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">🔒 Password Changed</h1>
      <p>Hello ${name},</p>
      <p>Your password has been successfully changed.</p>
      <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #166534;"><strong>✓ Your account is secure</strong></p>
        <p style="margin: 8px 0 0; font-size: 14px; color: #166534;">You can now sign in with your new password.</p>
      </div>
      <p>If you didn't make this change, please contact our support team immediately at support@earthintelligence.com</p>
      <p>Best regards,<br>The Earth Intelligence Team</p>
    </div>
  `;
  const text = `Password Changed. Hello ${name}, Your password has been successfully changed. If you didn't make this change, please contact support immediately.`;

  return sendEmail({ to: email, subject, text, html });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendDemoConfirmation,
  sendDemoNotification,
  sendContactConfirmation,
  sendContactNotification,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendPasswordChangedEmail,
  sendQuoteRequestConfirmation,
  sendQuoteRequestNotification,
  sendQuoteEmail
};
