const express = require('express');
const router = express.Router();
const ContactInquiry = require('../models/ContactInquiry');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const { sendContactConfirmation, sendContactNotification } = require('../services/email');
const { formLimiter } = require('../middleware/rateLimiter');
const { validateContactInquiry } = require('../middleware/validation');

/**
 * POST /api/contact - Create contact inquiry
 * Public endpoint - no authentication required, but captures user_id if authenticated
 */
router.post('/', optionalAuth, formLimiter, validateContactInquiry, async (req, res) => {
  try {
    const { full_name, email, company, subject, message } = req.body;

    // Validate required fields
    if (!full_name || !email || !subject || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          full_name: !full_name ? 'Full name is required' : undefined,
          email: !email ? 'Email is required' : undefined,
          subject: !subject ? 'Subject is required' : undefined,
          message: !message ? 'Message is required' : undefined
        }
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

    // Create contact inquiry
    const inquiry = new ContactInquiry({
      user_id: req.user?._id, // Optional - if user is authenticated
      inquiry_type: 'general',
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new'
    });

    await inquiry.save();

    // Send confirmation email to user
    try {
      await sendContactConfirmation(inquiry.email, inquiry.full_name);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to support team
    try {
      await sendContactNotification(inquiry);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Contact inquiry submitted successfully',
      inquiry: {
        id: inquiry._id,
        inquiry_type: inquiry.inquiry_type,
        status: inquiry.status,
        created_at: inquiry.created_at
      }
    });
  } catch (error) {
    console.error('Error creating contact inquiry:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }

    res.status(500).json({ error: 'Failed to submit contact inquiry' });
  }
});

/**
 * GET /api/contact/inquiries/user/:userId - Get user's contact inquiries
 * Requires authentication
 */
router.get('/inquiries/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own inquiries unless they're admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const inquiries = await ContactInquiry.find({ user_id: userId })
      .sort({ created_at: -1 });

    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching user contact inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch contact inquiries' });
  }
});

/**
 * GET /api/admin/contact/inquiries - Get all contact inquiries
 * Admin only
 */
router.get('/admin/contact/inquiries', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    const query = status ? { status } : {};
    
    const inquiries = await ContactInquiry.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('user_id', 'full_name email');

    const total = await ContactInquiry.countDocuments(query);

    res.json({
      inquiries,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin contact inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch contact inquiries' });
  }
});

/**
 * PUT /api/admin/contact/inquiries/:id/status - Update inquiry status
 * Admin only
 */
router.put('/admin/contact/inquiries/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status value
    const validStatuses = ['new', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        details: {
          status: `Status must be one of: ${validStatuses.join(', ')}`
        }
      });
    }

    const inquiry = await ContactInquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ error: 'Contact inquiry not found' });
    }

    res.json({
      message: 'Contact inquiry status updated',
      inquiry
    });
  } catch (error) {
    console.error('Error updating contact inquiry status:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid inquiry ID' });
    }
    
    res.status(500).json({ error: 'Failed to update contact inquiry status' });
  }
});

module.exports = router;
