const express = require('express');
const router = express.Router();
const QuoteRequest = require('../models/QuoteRequest');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimiter');
const { validateQuoteRequest } = require('../middleware/validation');

/**
 * Send quote request confirmation email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} quoteId - Quote request ID
 * @returns {Promise<Object>}
 */
async function sendQuoteConfirmation(email, name, quoteId) {
  const nodemailer = require('nodemailer');
  
  // Get transporter from email service
  let transporter;
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.EMAIL_API_KEY
      }
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
  }

  const subject = 'Quote Request Received - Earth Observation Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Quote Request Received</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in Earth Observation Platform!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Quote Request ID:</strong> ${quoteId}</p>
      </div>
      <p>We've received your quote request and our sales team is reviewing your requirements.</p>
      <p>You can expect to hear from us within 1-2 business days with a customized quote tailored to your needs.</p>
      <p>If you have any urgent questions, please contact us at sales@earthintelligence.com</p>
      <p>Best regards,<br>The Earth Observation Sales Team</p>
    </div>
  `;
  const text = `Quote Request Received. Hi ${name}, Thank you for your interest! Quote Request ID: ${quoteId}. Our sales team will contact you within 1-2 business days.`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@earthintelligence.com',
    to: email,
    subject,
    text,
    html
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send quote request notification to sales team
 * @param {Object} quoteRequest - Quote request object
 * @returns {Promise<Object>}
 */
async function sendQuoteNotification(quoteRequest) {
  const nodemailer = require('nodemailer');
  
  // Get transporter from email service
  let transporter;
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.EMAIL_API_KEY
      }
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
  }

  const salesEmail = process.env.SALES_EMAIL || 'sales@earthintelligence.com';
  const subject = 'New Quote Request';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">New Quote Request</h1>
      <p>A new quote request has been submitted:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Quote Request ID:</strong> ${quoteRequest._id}</p>
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
      <p>Please follow up with the customer within 1-2 business days with a customized quote.</p>
    </div>
  `;
  const text = `New Quote Request. Quote ID: ${quoteRequest._id}, Name: ${quoteRequest.fullName}, Email: ${quoteRequest.email}, Company: ${quoteRequest.companyName}, Industry: ${quoteRequest.industry}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@earthintelligence.com',
    to: salesEmail,
    subject,
    text,
    html
  };

  return transporter.sendMail(mailOptions);
}

/**
 * POST /api/quote/request
 * Create a new quote request
 * Public endpoint - no authentication required, but captures user_id if authenticated
 */
router.post('/request', optionalAuth, formLimiter, validateQuoteRequest, async (req, res) => {
  try {
    let { fullName, email, companyName, phoneNumber, industry, estimatedDataVolume, requirements } = req.body;

    // Decode HTML entities (fix for encoded slashes and other characters)
    const decodeHTMLEntities = (text) => {
      if (!text) return text;
      return text
        .replace(/&#x2F;/g, '/')
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    };

    // Decode all string fields
    fullName = decodeHTMLEntities(fullName);
    email = decodeHTMLEntities(email);
    companyName = decodeHTMLEntities(companyName);
    phoneNumber = decodeHTMLEntities(phoneNumber);
    industry = decodeHTMLEntities(industry);
    estimatedDataVolume = decodeHTMLEntities(estimatedDataVolume);
    requirements = decodeHTMLEntities(requirements);

    // Validate required fields
    if (!fullName || !email || !companyName || !phoneNumber || !industry || !estimatedDataVolume || !requirements) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['fullName', 'email', 'companyName', 'phoneNumber', 'industry', 'estimatedDataVolume', 'requirements']
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: {
          email: 'Please provide a valid email address'
        }
      });
    }

    // Create quote request with user_id if authenticated
    const quoteRequestData = {
      fullName,
      email,
      companyName,
      phoneNumber,
      industry,
      estimatedDataVolume,
      requirements,
      status: 'pending'
    };

    // Add user_id if user is authenticated
    if (req.user && req.user._id) {
      quoteRequestData.user_id = req.user._id;
    }

    const quoteRequest = new QuoteRequest(quoteRequestData);

    await quoteRequest.save();

    // Send confirmation email to user
    try {
      await sendQuoteConfirmation(email, fullName, quoteRequest._id);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to sales team
    try {
      await sendQuoteNotification(quoteRequest);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Quote request submitted successfully',
      quoteRequestId: quoteRequest._id,
      quoteRequest: {
        _id: quoteRequest._id,
        fullName: quoteRequest.fullName,
        email: quoteRequest.email,
        companyName: quoteRequest.companyName,
        phoneNumber: quoteRequest.phoneNumber,
        industry: quoteRequest.industry,
        estimatedDataVolume: quoteRequest.estimatedDataVolume,
        requirements: quoteRequest.requirements,
        status: quoteRequest.status,
        created_at: quoteRequest.created_at,
        updated_at: quoteRequest.updated_at
      }
    });
  } catch (error) {
    console.error('Error creating quote request:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ error: 'Failed to submit quote request' });
  }
});

/**
 * GET /api/quote/requests/user/:userId
 * Get all quote requests for a specific user
 * Requires authentication
 */
router.get('/requests/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own quote requests
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const quoteRequests = await QuoteRequest.find({ user_id: userId })
      .sort({ created_at: -1 });

    res.json({
      quoteRequests: quoteRequests.map(request => ({
        id: request._id,
        fullName: request.fullName,
        email: request.email,
        companyName: request.companyName,
        phoneNumber: request.phoneNumber,
        industry: request.industry,
        estimatedDataVolume: request.estimatedDataVolume,
        requirements: request.requirements,
        status: request.status,
        quoteDetails: request.quoteDetails,
        created_at: request.created_at,
        updated_at: request.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching user quote requests:', error);
    res.status(500).json({ error: 'Failed to fetch quote requests' });
  }
});

/**
 * GET /api/admin/quote/requests
 * Get all quote requests (admin only)
 * Requires admin authentication
 */
router.get('/admin/quote/requests', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    const quoteRequests = await QuoteRequest.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await QuoteRequest.countDocuments(query);

    res.json({
      quoteRequests: quoteRequests.map(request => ({
        id: request._id,
        fullName: request.fullName,
        email: request.email,
        companyName: request.companyName,
        phoneNumber: request.phoneNumber,
        industry: request.industry,
        estimatedDataVolume: request.estimatedDataVolume,
        requirements: request.requirements,
        status: request.status,
        quoteDetails: request.quoteDetails,
        created_at: request.created_at,
        updated_at: request.updated_at
      })),
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching all quote requests:', error);
    res.status(500).json({ error: 'Failed to fetch quote requests' });
  }
});

/**
 * PUT /api/admin/quote/requests/:id/status
 * Update quote request status (admin only)
 * Requires admin authentication
 */
router.put('/admin/quote/requests/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'quoted', 'accepted', 'declined'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        validStatuses
      });
    }

    const quoteRequest = await QuoteRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!quoteRequest) {
      return res.status(404).json({ error: 'Quote request not found' });
    }

    res.json({
      message: 'Quote request status updated successfully',
      quoteRequest: {
        id: quoteRequest._id,
        fullName: quoteRequest.fullName,
        email: quoteRequest.email,
        companyName: quoteRequest.companyName,
        phoneNumber: quoteRequest.phoneNumber,
        industry: quoteRequest.industry,
        estimatedDataVolume: quoteRequest.estimatedDataVolume,
        requirements: quoteRequest.requirements,
        status: quoteRequest.status,
        quoteDetails: quoteRequest.quoteDetails,
        created_at: quoteRequest.created_at,
        updated_at: quoteRequest.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating quote request status:', error);
    res.status(500).json({ error: 'Failed to update quote request status' });
  }
});

/**
 * PUT /api/admin/quote/requests/:id/quote
 * Add quote details to a quote request (admin only)
 * Requires admin authentication
 */
router.put('/admin/quote/requests/:id/quote', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { pricing, terms, validUntil } = req.body;

    // Validate required fields
    if (!pricing || !terms) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['pricing', 'terms']
      });
    }

    const quoteDetails = {
      pricing,
      terms,
      validUntil: validUntil ? new Date(validUntil) : undefined
    };

    const quoteRequest = await QuoteRequest.findByIdAndUpdate(
      id,
      { 
        quoteDetails,
        status: 'quoted' // Automatically update status to 'quoted'
      },
      { new: true, runValidators: true }
    );

    if (!quoteRequest) {
      return res.status(404).json({ error: 'Quote request not found' });
    }

    res.json({
      message: 'Quote details added successfully',
      quoteRequest: {
        id: quoteRequest._id,
        fullName: quoteRequest.fullName,
        email: quoteRequest.email,
        companyName: quoteRequest.companyName,
        phoneNumber: quoteRequest.phoneNumber,
        industry: quoteRequest.industry,
        estimatedDataVolume: quoteRequest.estimatedDataVolume,
        requirements: quoteRequest.requirements,
        status: quoteRequest.status,
        quoteDetails: quoteRequest.quoteDetails,
        created_at: quoteRequest.created_at,
        updated_at: quoteRequest.updated_at
      }
    });
  } catch (error) {
    console.error('Error adding quote details:', error);
    res.status(500).json({ error: 'Failed to add quote details' });
  }
});

module.exports = router;
