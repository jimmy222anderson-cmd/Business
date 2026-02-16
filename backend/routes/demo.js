const express = require('express');
const router = express.Router();
const DemoBooking = require('../models/DemoBooking');
const { sendDemoConfirmation, sendDemoNotification } = require('../services/email');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimiter');
const { validateDemoBooking } = require('../middleware/validation');

/**
 * POST /api/demo/book
 * Create a new demo booking
 * Public endpoint - no authentication required, but captures user_id if authenticated
 */
router.post('/book', optionalAuth, formLimiter, validateDemoBooking, async (req, res) => {
  try {
    const { fullName, email, companyName, phoneNumber, jobTitle, preferredDate, preferredTime, message } = req.body;

    // Validate required fields
    if (!fullName || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['fullName', 'email']
      });
    }

    // Create booking with user_id if authenticated
    const bookingData = {
      fullName,
      email,
      companyName,
      phoneNumber,
      jobTitle,
      preferredDate,
      preferredTime,
      message,
      status: 'pending'
    };

    // Add user_id if user is authenticated
    if (req.user && req.user._id) {
      bookingData.user_id = req.user._id;
    }

    const booking = new DemoBooking(bookingData);

    await booking.save();

    // Send confirmation email to user
    try {
      await sendDemoConfirmation(email, fullName, booking._id);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to sales team
    try {
      await sendDemoNotification(booking);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Demo booking created successfully',
      bookingId: booking._id,
      booking: {
        _id: booking._id,
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
    console.error('Error creating demo booking:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ error: 'Failed to create demo booking' });
  }
});

/**
 * GET /api/demo/bookings/user/:userId
 * Get all bookings for a specific user
 * Requires authentication
 */
router.get('/bookings/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own bookings
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const bookings = await DemoBooking.find({ user_id: userId })
      .sort({ created_at: -1 });

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
      }))
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * GET /api/admin/demo/bookings
 * Get all demo bookings (admin only)
 * Requires admin authentication
 */
router.get('/admin/demo/bookings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

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
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * PUT /api/admin/demo/bookings/:id/status
 * Update demo booking status (admin only)
 * Requires admin authentication
 */
router.put('/admin/demo/bookings/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
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

module.exports = router;
