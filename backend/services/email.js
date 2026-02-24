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
  const subject = 'Welcome to ATLAS Space & Data Systems';
  
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
  
  const text = `Welcome to Earth Observation Platform! Hi ${name}, Thank you for joining Earth Observation Platform. We're excited to have you on board!`;

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
  const subject = 'Demo Booking Confirmation - Earth Observation Platform';
  
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
      <p>Best regards,<br>The Earth Observation Team</p>
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
  const subject = 'We Received Your Message - Earth Observation Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Thank You for Contacting Us</h1>
      <p>Hi ${name},</p>
      <p>We've received your message and our team will get back to you within 24-48 hours.</p>
      <p>In the meantime, feel free to explore our platform and learn more about our services.</p>
      <p>Best regards,<br>The Earth Observation Team</p>
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
  const subject = 'Quote Request Received - Earth Observation Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Quote Request Received</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in Earth Observation Platform! We've received your quote request.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Request ID:</strong> ${quoteRequestId}</p>
      </div>
      <p>Our sales team will review your requirements and get back to you with a customized quote within 1-2 business days.</p>
      <p>In the meantime, feel free to explore our products and services on our website.</p>
      <p>If you have any urgent questions, please contact us at sales@earthintelligence.com</p>
      <p>Best regards,<br>The Earth Observation Team</p>
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
  const subject = 'Your Custom Quote - Earth Observation Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Your Custom Quote</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in Earth Observation Platform. We're pleased to provide you with a customized quote based on your requirements.</p>
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
      <p>Best regards,<br>The Earth Observation Sales Team</p>
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
  const subject = 'Password Reset Request - Earth Observation Platform';
  
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
  const subject = 'Verify Your Email - Earth Observation Platform';
  
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
  const subject = 'Password Changed Successfully - Earth Observation Platform';
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
      <p>Best regards,<br>The Earth Observation Team</p>
    </div>
  `;
  const text = `Password Changed. Hello ${name}, Your password has been successfully changed. If you didn't make this change, please contact support immediately.`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send imagery request confirmation email to user
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {Object} request - Imagery request object
 * @returns {Promise<Object>}
 */
async function sendImageryRequestConfirmation(email, name, request) {
  const subject = 'Imagery Request Received - Earth Observation Platform';
  
  // Format date range
  const startDate = new Date(request.date_range.start_date).toLocaleDateString();
  const endDate = new Date(request.date_range.end_date).toLocaleDateString();
  
  // Format filters
  const filtersList = [];
  if (request.filters.resolution_category && request.filters.resolution_category.length > 0) {
    filtersList.push(`Resolution: ${request.filters.resolution_category.join(', ').toUpperCase()}`);
  }
  if (request.filters.max_cloud_coverage !== undefined) {
    filtersList.push(`Max Cloud Coverage: ${request.filters.max_cloud_coverage}%`);
  }
  if (request.filters.providers && request.filters.providers.length > 0) {
    filtersList.push(`Providers: ${request.filters.providers.join(', ')}`);
  }
  if (request.filters.bands && request.filters.bands.length > 0) {
    filtersList.push(`Bands: ${request.filters.bands.join(', ')}`);
  }
  if (request.filters.image_types && request.filters.image_types.length > 0) {
    filtersList.push(`Image Types: ${request.filters.image_types.join(', ')}`);
  }
  
  const filtersHtml = filtersList.length > 0 
    ? filtersList.map(f => `<li>${f}</li>`).join('') 
    : '<li>No specific filters applied</li>';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Imagery Request Received</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in Earth Observation Platform! We've received your satellite imagery request.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Request ID:</strong> ${request._id}</p>
        <p><strong>Status:</strong> <span style="color: #EAB308; font-weight: bold;">${request.status.toUpperCase()}</span></p>
        <p><strong>Area of Interest:</strong></p>
        <ul style="margin: 5px 0;">
          <li>Type: ${request.aoi_type}</li>
          <li>Area: ${request.aoi_area_km2.toFixed(2)} km²</li>
          <li>Center: ${request.aoi_center.lat.toFixed(4)}°, ${request.aoi_center.lng.toFixed(4)}°</li>
        </ul>
        <p><strong>Date Range:</strong> ${startDate} to ${endDate}</p>
        <p><strong>Urgency:</strong> ${request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}</p>
        <p><strong>Filters Applied:</strong></p>
        <ul style="margin: 5px 0;">
          ${filtersHtml}
        </ul>
        ${request.additional_requirements ? `<p><strong>Additional Requirements:</strong><br>${request.additional_requirements}</p>` : ''}
      </div>
      <p>Our team will review your request and get back to you within 1-2 business days with availability and pricing information.</p>
      <p>You can track the status of your request using the Request ID above.</p>
      <p>If you have any urgent questions, please contact us at sales@earthintelligence.com</p>
      <p>Best regards,<br>The Earth Observation Team</p>
    </div>
  `;
  
  const text = `Imagery Request Received. Hi ${name}, We've received your satellite imagery request (ID: ${request._id}). Area: ${request.aoi_area_km2.toFixed(2)} km², Date Range: ${startDate} to ${endDate}, Urgency: ${request.urgency}. Our team will review your request and get back to you within 1-2 business days.`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send imagery request notification to admin/sales team
 * @param {Object} request - Imagery request object
 * @returns {Promise<Object>}
 */
async function sendImageryRequestNotification(request) {
  const adminEmail = process.env.SALES_EMAIL || 'sales@earthintelligence.com';
  const subject = 'New Satellite Imagery Request';
  
  // Format date range
  const startDate = new Date(request.date_range.start_date).toLocaleDateString();
  const endDate = new Date(request.date_range.end_date).toLocaleDateString();
  
  // Format filters
  const filtersList = [];
  if (request.filters.resolution_category && request.filters.resolution_category.length > 0) {
    filtersList.push(`Resolution: ${request.filters.resolution_category.join(', ').toUpperCase()}`);
  }
  if (request.filters.max_cloud_coverage !== undefined) {
    filtersList.push(`Max Cloud Coverage: ${request.filters.max_cloud_coverage}%`);
  }
  if (request.filters.providers && request.filters.providers.length > 0) {
    filtersList.push(`Providers: ${request.filters.providers.join(', ')}`);
  }
  if (request.filters.bands && request.filters.bands.length > 0) {
    filtersList.push(`Bands: ${request.filters.bands.join(', ')}`);
  }
  if (request.filters.image_types && request.filters.image_types.length > 0) {
    filtersList.push(`Image Types: ${request.filters.image_types.join(', ')}`);
  }
  
  const filtersHtml = filtersList.length > 0 
    ? filtersList.map(f => `<li>${f}</li>`).join('') 
    : '<li>No specific filters applied</li>';
  
  // Urgency badge color
  const urgencyColor = request.urgency === 'emergency' ? '#dc2626' : 
                       request.urgency === 'urgent' ? '#f59e0b' : '#10b981';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">🛰️ New Satellite Imagery Request</h1>
      <p>A new satellite imagery request has been submitted and requires review.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Request ID:</strong> ${request._id}</p>
        <p><strong>Status:</strong> ${request.status.toUpperCase()}</p>
        <p><strong>Urgency:</strong> <span style="background-color: ${urgencyColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${request.urgency.toUpperCase()}</span></p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        <p><strong>Customer Information:</strong></p>
        <ul style="margin: 5px 0;">
          <li>Name: ${request.full_name}</li>
          <li>Email: ${request.email}</li>
          <li>Company: ${request.company || 'N/A'}</li>
          <li>Phone: ${request.phone || 'N/A'}</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        <p><strong>Area of Interest:</strong></p>
        <ul style="margin: 5px 0;">
          <li>Type: ${request.aoi_type}</li>
          <li>Area: ${request.aoi_area_km2.toFixed(2)} km²</li>
          <li>Center: ${request.aoi_center.lat.toFixed(4)}°, ${request.aoi_center.lng.toFixed(4)}°</li>
        </ul>
        <p><strong>Date Range:</strong> ${startDate} to ${endDate}</p>
        <p><strong>Filters Applied:</strong></p>
        <ul style="margin: 5px 0;">
          ${filtersHtml}
        </ul>
        ${request.additional_requirements ? `<p><strong>Additional Requirements:</strong><br><span style="white-space: pre-wrap;">${request.additional_requirements}</span></p>` : ''}
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        <p><strong>Submitted:</strong> ${new Date(request.created_at).toLocaleString()}</p>
      </div>
      <p>Please review this request and respond to the customer within 1-2 business days.</p>
      <p style="background-color: #fef3c7; border-left: 4px solid #EAB308; padding: 12px; border-radius: 4px;">
        <strong>Action Required:</strong> Log in to the admin panel to review and update the request status.
      </p>
    </div>
  `;
  
  const text = `New Satellite Imagery Request. Request ID: ${request._id}, Customer: ${request.full_name} (${request.email}), Company: ${request.company || 'N/A'}, Area: ${request.aoi_area_km2.toFixed(2)} km², Date Range: ${startDate} to ${endDate}, Urgency: ${request.urgency.toUpperCase()}. Please review and respond within 1-2 business days.`;

  return sendEmail({ to: adminEmail, subject, text, html });
}

/**
 * Send imagery request status change notification to user
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {Object} request - Imagery request object
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @returns {Promise<Object>}
 */
async function sendImageryRequestStatusUpdate(email, name, request, oldStatus, newStatus) {
  const subject = `Imagery Request Status Update - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;
  
  // Status-specific messages
  const statusMessages = {
    reviewing: 'Our team is currently reviewing your imagery request.',
    quoted: 'We have prepared a quote for your imagery request.',
    approved: 'Great news! Your imagery request has been approved.',
    completed: 'Your imagery request has been completed.',
    cancelled: 'Your imagery request has been cancelled.'
  };
  
  const statusColors = {
    pending: '#EAB308',
    reviewing: '#3b82f6',
    quoted: '#a855f7',
    approved: '#10b981',
    completed: '#059669',
    cancelled: '#dc2626'
  };
  
  const statusMessage = statusMessages[newStatus] || 'Your imagery request status has been updated.';
  const statusColor = statusColors[newStatus] || '#6b7280';
  
  // Build quote section if available
  let quoteSection = '';
  if (request.quote_amount && newStatus === 'quoted') {
    quoteSection = `
      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #065f46;">Quote Details</h3>
        <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 10px 0;">
          ${request.quote_currency || 'USD'} $${request.quote_amount.toLocaleString()}
        </p>
        <p style="margin: 0; font-size: 14px; color: #166534;">
          Please review the quote and contact us if you have any questions.
        </p>
      </div>
    `;
  }
  
  // Build admin notes section if available
  let notesSection = '';
  if (request.admin_notes) {
    notesSection = `
      <div style="background-color: #f5f5f5; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Notes from our team:</strong></p>
        <p style="margin: 10px 0 0; font-size: 14px; color: #4b5563; white-space: pre-wrap;">${request.admin_notes}</p>
      </div>
    `;
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">📬 Request Status Update</h1>
      <p>Hi ${name},</p>
      <p>${statusMessage}</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Request ID:</strong> ${request._id}</p>
        <div style="margin: 15px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Status Update:</strong></p>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background-color: ${statusColors[oldStatus]}; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 12px;">
              ${oldStatus}
            </span>
            <span style="font-size: 20px;">→</span>
            <span style="background-color: ${statusColor}; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 12px;">
              ${newStatus}
            </span>
          </div>
        </div>
        <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      ${quoteSection}
      ${notesSection}
      
      <p>You can view the full details of your request and track its progress by logging into your account.</p>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact us at sales@earthintelligence.com</p>
      
      <p>Best regards,<br>The Earth Observation Team</p>
    </div>
  `;
  
  const text = `Imagery Request Status Update. Hi ${name}, ${statusMessage} Request ID: ${request._id}. Status changed from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}. ${request.quote_amount && newStatus === 'quoted' ? `Quote: ${request.quote_currency || 'USD'} $${request.quote_amount}. ` : ''}${request.admin_notes ? `Notes: ${request.admin_notes}` : ''}`;

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
  sendQuoteEmail,
  sendImageryRequestConfirmation,
  sendImageryRequestNotification,
  sendImageryRequestStatusUpdate
};
