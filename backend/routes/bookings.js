const express = require('express');
const router = express.Router();
const DemoBooking = require('../models/DemoBooking');
const { sendDemoConfirmation } = require('../services/email');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/bookings
 * Create a new demo booking
 * Public endpoint - no authentication required
 */
router.post('/', async (req, res) => {
  try {
    const { full_name, email, company, phone, preferred_date, preferred_time, message } = req.body;

    // Validate required fields
    if (!full_name || !email || !company || !phone || !preferred_date || !preferred_time || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['full_name', 'email', 'company', 'phone', 'preferred_date', 'preferred_time', 'message']
      });
    }

    // Create booking
    const booking = new DemoBooking({
      full_name,
      email,
      company,
      phone,
      preferred_date: new Date(preferred_date),
      preferred_time,
      message,
      status: 'pending'
    });

    await booking.save();

    // Send confirmation email
    try {
      await sendDemoConfirmation(email, full_name, booking.preferred_date, booking.preferred_time);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Demo booking created successfully',
      booking: {
        _id: booking._id,
        full_name: booking.full_name,
        email: booking.email,
        company: booking.company,
        phone: booking.phone,
        preferred_date: booking.preferred_date,
        preferred_time: booking.preferred_time,
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
 * GET /api/bookings/user/:userId
 * Get all bookings for a specific user
 * Requires authentication
 */
router.get('/user/:userId', requireAuth, async (req, res) => {
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
        full_name: booking.full_name,
        email: booking.email,
        company: booking.company,
        phone: booking.phone,
        preferred_date: booking.preferred_date,
        preferred_time: booking.preferred_time,
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

module.exports = router;
