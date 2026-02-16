const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const UserProfile = require('../models/UserProfile');
const DemoBooking = require('../models/DemoBooking');
const ProductInquiry = require('../models/ProductInquiry');
const ContactInquiry = require('../models/ContactInquiry');
const QuoteRequest = require('../models/QuoteRequest');

/**
 * GET /api/users/:id/profile
 * Get user profile by ID
 * Requires authentication - users can only access their own profile
 */
router.get('/:id/profile', requireAuth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    
    // Check if user is requesting their own profile
    if (req.user._id.toString() !== requestedUserId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own profile'
      });
    }

    // Find user by ID
    const user = await UserProfile.findById(requestedUserId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Return user profile (password_hash excluded by toJSON transform)
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        company: user.company,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user profile'
    });
  }
});

/**
 * PUT /api/users/:id/profile
 * Update user profile by ID
 * Requires authentication - users can only update their own profile
 */
router.put('/:id/profile', requireAuth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    
    // Check if user is updating their own profile
    if (req.user._id.toString() !== requestedUserId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own profile'
      });
    }

    const { full_name, company } = req.body;

    // Find and update user
    const user = await UserProfile.findById(requestedUserId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (full_name !== undefined) {
      user.full_name = full_name;
    }
    if (company !== undefined) {
      user.company = company;
    }

    await user.save();

    // Return updated user profile
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        company: user.company,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user profile'
    });
  }
});

/**
 * GET /api/users/:id/bookings
 * Get all demo bookings for a user
 * Requires authentication - users can only access their own bookings
 */
router.get('/:id/bookings', requireAuth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    
    // Check if user is requesting their own bookings
    if (req.user._id.toString() !== requestedUserId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own bookings'
      });
    }

    // Find all bookings for this user
    const bookings = await DemoBooking.find({ user_id: requestedUserId })
      .sort({ created_at: -1 });

    res.json({
      bookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user bookings'
    });
  }
});

/**
 * GET /api/users/:id/inquiries
 * Get all product inquiries for a user
 * Requires authentication - users can only access their own inquiries
 */
router.get('/:id/inquiries', requireAuth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    
    // Check if user is requesting their own inquiries
    if (req.user._id.toString() !== requestedUserId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own inquiries'
      });
    }

    // Find all product inquiries for this user
    const inquiries = await ProductInquiry.find({ user_id: requestedUserId })
      .sort({ created_at: -1 });

    res.json({
      inquiries
    });
  } catch (error) {
    console.error('Get user inquiries error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user inquiries'
    });
  }
});

/**
 * GET /api/users/:id/contact-inquiries
 * Get all contact inquiries for a user
 * Requires authentication - users can only access their own contact inquiries
 */
router.get('/:id/contact-inquiries', requireAuth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    
    // Check if user is requesting their own contact inquiries
    if (req.user._id.toString() !== requestedUserId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own contact inquiries'
      });
    }

    // Find all contact inquiries for this user
    const contactInquiries = await ContactInquiry.find({ user_id: requestedUserId })
      .sort({ created_at: -1 });

    res.json({
      contactInquiries
    });
  } catch (error) {
    console.error('Get user contact inquiries error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user contact inquiries'
    });
  }
});

/**
 * GET /api/users/:id/quote-requests
 * Get all quote requests for a user
 * Requires authentication - users can only access their own quote requests
 */
router.get('/:id/quote-requests', requireAuth, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    
    // Check if user is requesting their own quote requests
    if (req.user._id.toString() !== requestedUserId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own quote requests'
      });
    }

    // Find all quote requests for this user
    const quoteRequests = await QuoteRequest.find({ user_id: requestedUserId })
      .sort({ created_at: -1 });

    res.json({
      quoteRequests
    });
  } catch (error) {
    console.error('Get user quote requests error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user quote requests'
    });
  }
});

module.exports = router;
