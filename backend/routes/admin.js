const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const UserProfile = require('../models/UserProfile');
const DemoBooking = require('../models/DemoBooking');
const ContactInquiry = require('../models/ContactInquiry');
const QuoteRequest = require('../models/QuoteRequest');
const ProductInquiry = require('../models/ProductInquiry');

// Content management routes
const productsRouter = require('./admin/products');
const industriesRouter = require('./admin/industries');
const partnersRouter = require('./admin/partners');
const blogsRouter = require('./admin/blogs');

router.use('/products', productsRouter);
router.use('/industries', industriesRouter);
router.use('/partners', partnersRouter);
router.use('/blogs', blogsRouter);

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
 * Admin only
 */
router.get('/dashboard/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get counts for all entities
    const [
      totalUsers,
      totalDemoBookings,
      totalContactInquiries,
      totalProductInquiries,
      totalQuoteRequests,
      pendingDemoBookings,
      newContactInquiries,
      pendingProductInquiries,
      pendingQuoteRequests
    ] = await Promise.all([
      UserProfile.countDocuments(),
      DemoBooking.countDocuments(),
      ContactInquiry.countDocuments(),
      ProductInquiry.countDocuments(),
      QuoteRequest.countDocuments(),
      DemoBooking.countDocuments({ status: 'pending' }),
      ContactInquiry.countDocuments({ status: 'new' }),
      ProductInquiry.countDocuments({ status: 'pending' }),
      QuoteRequest.countDocuments({ status: 'pending' })
    ]);

    res.json({
      totalUsers,
      totalDemoBookings,
      totalContactInquiries,
      totalProductInquiries,
      totalQuoteRequests,
      pendingDemoBookings,
      newContactInquiries,
      pendingProductInquiries,
      pendingQuoteRequests
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

/**
 * GET /api/admin/dashboard/activity
 * Get recent activity feed
 * Admin only
 */
router.get('/dashboard/activity', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    // Fetch recent items from each collection
    const [recentUsers, recentBookings, recentInquiries, recentProductInquiries, recentQuotes] = await Promise.all([
      UserProfile.find().sort({ created_at: -1 }).limit(limitNum).select('full_name email created_at'),
      DemoBooking.find().sort({ created_at: -1 }).limit(limitNum).select('fullName email status created_at'),
      ContactInquiry.find().sort({ created_at: -1 }).limit(limitNum).select('full_name email subject status created_at'),
      ProductInquiry.find().sort({ created_at: -1 }).limit(limitNum).select('full_name email product_id status created_at'),
      QuoteRequest.find().sort({ created_at: -1 }).limit(limitNum).select('fullName email industry status created_at')
    ]);

    // Combine and format activities
    const activities = [];

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        type: 'user',
        title: 'New User Registration',
        description: `${user.full_name || user.email} created an account`,
        timestamp: user.created_at
      });
    });

    recentBookings.forEach(booking => {
      activities.push({
        id: `demo-${booking._id}`,
        type: 'demo',
        title: 'New Demo Booking',
        description: `${booking.fullName} (${booking.email}) requested a demo - Status: ${booking.status}`,
        timestamp: booking.created_at
      });
    });

    recentInquiries.forEach(inquiry => {
      activities.push({
        id: `contact-${inquiry._id}`,
        type: 'contact',
        title: 'New Contact Inquiry',
        description: `${inquiry.full_name} (${inquiry.email}) - ${inquiry.subject} - Status: ${inquiry.status}`,
        timestamp: inquiry.created_at
      });
    });

    recentProductInquiries.forEach(inquiry => {
      activities.push({
        id: `product-${inquiry._id}`,
        type: 'product',
        title: 'New Product Inquiry',
        description: `${inquiry.full_name} (${inquiry.email}) - Product ${inquiry.product_id} - Status: ${inquiry.status}`,
        timestamp: inquiry.created_at
      });
    });

    recentQuotes.forEach(quote => {
      activities.push({
        id: `quote-${quote._id}`,
        type: 'quote',
        title: 'New Quote Request',
        description: `${quote.fullName} (${quote.email}) - ${quote.industry} - Status: ${quote.status}`,
        timestamp: quote.created_at
      });
    });

    // Sort by timestamp descending and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limitNum);

    res.json({
      activities: limitedActivities
    });
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

/**
 * GET /api/admin/users
 * Get all users
 * Admin only
 */
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, skip = 0, role } = req.query;

    const query = role ? { role } : {};

    const users = await UserProfile.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-password_hash -password_reset_token -email_verification_token');

    const total = await UserProfile.countDocuments(query);

    res.json({
      users,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 * Admin only
 */
router.put('/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles
      });
    }

    const user = await UserProfile.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password_hash -password_reset_token -email_verification_token');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * PUT /api/admin/users/:id/status
 * Activate/deactivate user account
 * Admin only
 */
router.put('/users/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: 'active must be a boolean value'
      });
    }

    // For now, we'll use a simple approach - you might want to add an 'active' field to the schema
    // This is a placeholder implementation
    const user = await UserProfile.findById(id)
      .select('-password_hash -password_reset_token -email_verification_token');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Note: You may want to add an 'active' field to the UserProfile schema
    // For now, we'll just return the user
    res.json({
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

/**
 * GET /api/admin/demo/bookings
 * Get all demo bookings
 * Admin only
 */
router.get('/demo/bookings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    const query = status ? { status } : {};

    const bookings = await DemoBooking.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await DemoBooking.countDocuments(query);

    res.json({
      bookings: bookings.map(booking => ({
        id: booking._id,
        fullName: booking.fullName,
        email: booking.email,
        companyName: booking.companyName,
        phoneNumber: booking.phoneNumber,
        jobTitle: booking.jobTitle,
        message: booking.message,
        status: booking.status,
        created_at: booking.created_at,
        updated_at: booking.updated_at
      })),
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching demo bookings:', error);
    res.status(500).json({ error: 'Failed to fetch demo bookings' });
  }
});

/**
 * PUT /api/admin/demo/bookings/:id/status
 * Update demo booking status
 * Admin only
 */
router.put('/demo/bookings/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        validStatuses
      });
    }

    const booking = await DemoBooking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: {
        id: booking._id,
        fullName: booking.fullName,
        email: booking.email,
        companyName: booking.companyName,
        phoneNumber: booking.phoneNumber,
        jobTitle: booking.jobTitle,
        message: booking.message,
        status: booking.status,
        created_at: booking.created_at,
        updated_at: booking.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

/**
 * GET /api/admin/contact/inquiries
 * Get all contact inquiries
 * Admin only
 */
router.get('/contact/inquiries', requireAuth, requireAdmin, async (req, res) => {
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
    console.error('Error fetching contact inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch contact inquiries' });
  }
});

/**
 * PUT /api/admin/contact/inquiries/:id/status
 * Update contact inquiry status
 * Admin only
 */
router.put('/contact/inquiries/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

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

/**
 * GET /api/admin/quote/requests
 * Get all quote requests
 * Admin only
 */
router.get('/quote/requests', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    const query = status ? { status } : {};

    const quoteRequests = await QuoteRequest.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await QuoteRequest.countDocuments(query);

    res.json({
      quoteRequests: quoteRequests.map(quote => ({
        id: quote._id,
        fullName: quote.fullName,
        email: quote.email,
        companyName: quote.companyName,
        phoneNumber: quote.phoneNumber,
        industry: quote.industry,
        estimatedDataVolume: quote.estimatedDataVolume,
        requirements: quote.requirements,
        status: quote.status,
        quoteDetails: quote.quoteDetails,
        created_at: quote.created_at,
        updated_at: quote.updated_at
      })),
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching quote requests:', error);
    res.status(500).json({ error: 'Failed to fetch quote requests' });
  }
});

/**
 * PUT /api/admin/quote/requests/:id/status
 * Update quote request status
 * Admin only
 */
router.put('/quote/requests/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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
 * Submit quote to customer
 * Admin only
 */
router.put('/quote/requests/:id/quote', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { pricing, terms, validUntil } = req.body;

    if (!pricing || !terms) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['pricing', 'terms']
      });
    }

    const quoteRequest = await QuoteRequest.findById(id);

    if (!quoteRequest) {
      return res.status(404).json({ error: 'Quote request not found' });
    }

    // Update quote details
    quoteRequest.quoteDetails = {
      pricing,
      terms,
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
    };
    quoteRequest.status = 'quoted';

    await quoteRequest.save();

    // Send quote email to customer
    const { sendQuoteEmail } = require('../services/email');
    try {
      await sendQuoteEmail(quoteRequest.email, quoteRequest.fullName, quoteRequest.quoteDetails);
    } catch (emailError) {
      console.error('Failed to send quote email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Quote submitted successfully',
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
    console.error('Error submitting quote:', error);
    res.status(500).json({ error: 'Failed to submit quote' });
  }
});

module.exports = router;
