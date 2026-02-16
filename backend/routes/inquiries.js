const express = require('express');
const router = express.Router();
const ContactInquiry = require('../models/ContactInquiry');
const ProductInquiry = require('../models/ProductInquiry');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

// POST /api/inquiries - Create general contact inquiry
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { full_name, email, company, subject, message, inquiry_type } = req.body;

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

    // Create inquiry
    const inquiry = new ContactInquiry({
      user_id: req.user?._id, // Optional - if user is authenticated
      inquiry_type: inquiry_type || 'general',
      full_name,
      email,
      company,
      subject,
      message,
      status: 'new'
    });

    await inquiry.save();

    // TODO: Send confirmation email to user
    // TODO: Send notification email to support team

    res.status(201).json({
      message: 'Inquiry submitted successfully',
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

    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// POST /api/inquiries/product - Create product-specific inquiry
router.post('/product', optionalAuth, async (req, res) => {
  try {
    const { product_id, full_name, email, company, message } = req.body;

    // Validate required fields
    if (!product_id || !full_name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          product_id: !product_id ? 'Product ID is required' : undefined,
          full_name: !full_name ? 'Full name is required' : undefined,
          email: !email ? 'Email is required' : undefined,
          message: !message ? 'Message is required' : undefined
        }
      });
    }

    // Create product inquiry
    const inquiry = new ProductInquiry({
      user_id: req.user?._id, // Optional - if user is authenticated
      product_id,
      full_name,
      email,
      company,
      message,
      status: 'pending'
    });

    await inquiry.save();

    // TODO: Send confirmation email to user
    // TODO: Send notification email to sales team

    res.status(201).json({
      message: 'Product inquiry submitted successfully',
      inquiry: {
        id: inquiry._id,
        product_id: inquiry.product_id,
        status: inquiry.status,
        created_at: inquiry.created_at
      }
    });
  } catch (error) {
    console.error('Error creating product inquiry:', error);
    
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

    res.status(500).json({ error: 'Failed to submit product inquiry' });
  }
});

// GET /api/inquiries/user/:userId - Get user's contact inquiries (authenticated)
router.get('/user/:userId', requireAuth, async (req, res) => {
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
    console.error('Error fetching user inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// GET /api/inquiries/product/user/:userId - Get user's product inquiries (authenticated)
router.get('/product/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own inquiries unless they're admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const inquiries = await ProductInquiry.find({ user_id: userId })
      .sort({ created_at: -1 });

    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching user product inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch product inquiries' });
  }
});

// GET /api/inquiries/admin - Get all contact inquiries (admin only)
router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
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
    console.error('Error fetching admin inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// GET /api/inquiries/product/admin - Get all product inquiries (admin only)
router.get('/product/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, product_id, limit = 50, skip = 0 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (product_id) query.product_id = product_id;
    
    const inquiries = await ProductInquiry.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('user_id', 'full_name email');

    const total = await ProductInquiry.countDocuments(query);

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
    console.error('Error fetching admin product inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch product inquiries' });
  }
});

// PUT /api/inquiries/:id/status - Update inquiry status (admin only)
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const inquiry = await ContactInquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({
      message: 'Inquiry status updated',
      inquiry
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ error: 'Failed to update inquiry status' });
  }
});

// PUT /api/inquiries/product/:id/status - Update product inquiry status (admin only)
router.put('/product/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const inquiry = await ProductInquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ error: 'Product inquiry not found' });
    }

    res.json({
      message: 'Product inquiry status updated',
      inquiry
    });
  } catch (error) {
    console.error('Error updating product inquiry status:', error);
    res.status(500).json({ error: 'Failed to update product inquiry status' });
  }
});

module.exports = router;
