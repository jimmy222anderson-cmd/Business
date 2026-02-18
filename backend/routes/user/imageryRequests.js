const express = require('express');
const router = express.Router();
const ImageryRequest = require('../../models/ImageryRequest');
const { requireAuth } = require('../../middleware/auth');

// Apply authentication middleware to all routes
router.use(requireAuth);

// POST /api/user/imagery-requests/:id/cancel - Cancel imagery request
// This must come BEFORE the /:id route to avoid route conflicts
router.post('/:id/cancel', async (req, res, next) => {
  console.log('Cancel route hit with ID:', req.params.id);
  console.log('Request body:', req.body);
  console.log('User ID:', req.userId);
  
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;
    
    // Find request and verify ownership
    const request = await ImageryRequest.findOne({
      _id: id,
      user_id: req.userId
    });
    
    if (!request) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Imagery request not found or you do not have access to it'
      });
    }
    
    // Check if request can be cancelled
    const cancellableStatuses = ['pending', 'reviewing'];
    if (!cancellableStatuses.includes(request.status)) {
      return res.status(400).json({ 
        error: 'Cannot cancel request',
        message: `Requests with status "${request.status}" cannot be cancelled. Only pending or reviewing requests can be cancelled.`,
        currentStatus: request.status,
        cancellableStatuses
      });
    }
    
    // Update status to cancelled
    request.status = 'cancelled';
    if (cancellation_reason) {
      request.admin_notes = `Cancelled by user: ${cancellation_reason}`;
    } else {
      request.admin_notes = 'Cancelled by user';
    }
    
    await request.save();
    
    // Send email notification to admin about cancellation
    try {
      const emailService = require('../../services/email');
      const adminEmail = process.env.SALES_EMAIL || 'sales@earthintelligence.com';
      
      await emailService.sendEmail({
        to: adminEmail,
        subject: 'Imagery Request Cancelled by User',
        text: `Request ${request._id} has been cancelled by the user. Reason: ${cancellation_reason || 'No reason provided'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Imagery Request Cancelled</h1>
            <p>A user has cancelled their imagery request.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Request ID:</strong> ${request._id}</p>
              <p><strong>User:</strong> ${request.full_name} (${request.email})</p>
              <p><strong>Previous Status:</strong> ${request.status_history && request.status_history.length > 1 ? request.status_history[request.status_history.length - 2].status : 'pending'}</p>
              <p><strong>Cancellation Reason:</strong> ${cancellation_reason || 'No reason provided'}</p>
              <p><strong>Cancelled At:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send cancellation notification email:', emailError);
      // Don't fail the cancellation if email fails
    }
    
    res.json({
      message: 'Imagery request cancelled successfully',
      request: {
        _id: request._id,
        status: request.status,
        updated_at: request.updated_at
      }
    });
  } catch (error) {
    console.error('Error cancelling imagery request:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid request ID',
        message: 'The provided request ID is not valid'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to cancel imagery request',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/user/imagery-requests - Get user's imagery requests
router.get('/', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = { user_id: req.userId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    // Fetch requests with pagination
    const [requests, total] = await Promise.all([
      ImageryRequest.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-admin_notes -reviewed_by') // Exclude admin-only fields
        .lean(),
      ImageryRequest.countDocuments(query)
    ]);
    
    res.json({
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching user imagery requests:', error);
    res.status(500).json({ 
      error: 'Failed to fetch imagery requests',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/user/imagery-requests/:id - Get single imagery request
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find request and verify ownership
    const request = await ImageryRequest.findOne({
      _id: id,
      user_id: req.userId
    })
      .select('-admin_notes -reviewed_by') // Exclude admin-only fields
      .lean();
    
    if (!request) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Imagery request not found or you do not have access to it'
      });
    }
    
    res.json({ request });
  } catch (error) {
    console.error('Error fetching imagery request:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid request ID',
        message: 'The provided request ID is not valid'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch imagery request',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
