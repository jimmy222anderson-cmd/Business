const express = require('express');
const router = express.Router();
const ImageryRequest = require('../../models/ImageryRequest');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { validateObjectId } = require('../../middleware/validation');

// GET /api/admin/imagery-requests - Get all imagery requests with filters
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      status,
      date_from,
      date_to,
      user_id,
      urgency,
      email,
      sort = 'created_at',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};

    // Add filters if provided
    if (status) {
      query.status = status;
    }

    if (urgency) {
      query.urgency = urgency;
    }

    if (user_id) {
      query.user_id = user_id;
    }

    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    // Add date range filter
    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) {
        query.created_at.$gte = new Date(date_from);
      }
      if (date_to) {
        // Set to end of day
        const endDate = new Date(date_to);
        endDate.setHours(23, 59, 59, 999);
        query.created_at.$lte = endDate;
      }
    }

    // Build sort object
    const sortObj = {};
    const validSortFields = ['created_at', 'updated_at', 'status', 'urgency', 'aoi_area_km2', 'full_name', 'email'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    sortObj[sortField] = order === 'asc' ? 1 : -1;

    // Add secondary sort by created_at for consistency
    if (sortField !== 'created_at') {
      sortObj.created_at = -1;
    }

    // Parse pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [requests, total] = await Promise.all([
      ImageryRequest.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('user_id', 'full_name email company')
        .populate('reviewed_by', 'full_name email')
        .select('-__v')
        .lean(),
      ImageryRequest.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching imagery requests:', error);

    // Handle invalid date format
    if (error.message && error.message.includes('Invalid Date')) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Please provide dates in ISO format (YYYY-MM-DD)'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch imagery requests',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin/imagery-requests/export - Export imagery requests as CSV
// NOTE: This route MUST come BEFORE /:id route to avoid "export" being treated as an ID
// Using explicit path to ensure it's matched before the /:id route
router.get('/export', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      status,
      date_from,
      date_to,
      user_id,
      urgency,
      email
    } = req.query;

    // Build query (same as main GET route)
    const query = {};

    if (status) {
      query.status = status;
    }

    if (urgency) {
      query.urgency = urgency;
    }

    if (user_id) {
      query.user_id = user_id;
    }

    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    // Add date range filter
    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) {
        query.created_at.$gte = new Date(date_from);
      }
      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setHours(23, 59, 59, 999);
        query.created_at.$lte = endDate;
      }
    }

    // Fetch all matching requests (no pagination for export)
    const requests = await ImageryRequest.find(query)
      .sort({ created_at: -1 })
      .populate('user_id', 'full_name email company')
      .populate('reviewed_by', 'full_name email')
      .select('-__v')
      .lean();

    // Generate CSV content
    const csvRows = [];
    
    // CSV Headers
    const headers = [
      'Request ID',
      'Status',
      'Urgency',
      'Full Name',
      'Email',
      'Company',
      'Phone',
      'AOI Type',
      'AOI Area (km²)',
      'AOI Center Lat',
      'AOI Center Lng',
      'Date Range Start',
      'Date Range End',
      'Resolution Categories',
      'Max Cloud Coverage (%)',
      'Providers',
      'Bands',
      'Image Types',
      'Additional Requirements',
      'Quote Amount',
      'Quote Currency',
      'Admin Notes',
      'Created At',
      'Updated At',
      'Reviewed At',
      'Reviewed By'
    ];
    csvRows.push(headers.join(','));

    // CSV Data Rows
    requests.forEach(request => {
      const row = [
        request._id,
        request.status,
        request.urgency,
        escapeCsvValue(request.full_name),
        escapeCsvValue(request.email),
        escapeCsvValue(request.company || ''),
        escapeCsvValue(request.phone || ''),
        request.aoi_type,
        request.aoi_area_km2,
        request.aoi_center.lat,
        request.aoi_center.lng,
        new Date(request.date_range.start_date).toISOString().split('T')[0],
        new Date(request.date_range.end_date).toISOString().split('T')[0],
        escapeCsvValue((request.filters?.resolution_category || []).join('; ')),
        request.filters?.max_cloud_coverage || '',
        escapeCsvValue((request.filters?.providers || []).join('; ')),
        escapeCsvValue((request.filters?.bands || []).join('; ')),
        escapeCsvValue((request.filters?.image_types || []).join('; ')),
        escapeCsvValue(request.additional_requirements || ''),
        request.quote_amount || '',
        request.quote_currency || '',
        escapeCsvValue(request.admin_notes || ''),
        new Date(request.created_at).toISOString(),
        new Date(request.updated_at).toISOString(),
        request.reviewed_at ? new Date(request.reviewed_at).toISOString() : '',
        request.reviewed_by ? escapeCsvValue(request.reviewed_by.full_name || request.reviewed_by.email) : ''
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Set headers for file download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `imagery-requests-${timestamp}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting imagery requests:', error);

    // Handle invalid date format
    if (error.message && error.message.includes('Invalid Date')) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Please provide dates in ISO format (YYYY-MM-DD)'
      });
    }

    res.status(500).json({
      error: 'Failed to export imagery requests',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to escape CSV values
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If value contains comma, newline, or double quote, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

// GET /api/admin/imagery-requests/:id - Get single imagery request
router.get('/:id', requireAuth, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ImageryRequest.findById(id)
      .populate('user_id', 'full_name email company phone')
      .populate('reviewed_by', 'full_name email')
      .populate('status_history.changed_by', 'full_name email')
      .select('-__v')
      .lean();

    if (!request) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Imagery request not found'
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

// PUT /api/admin/imagery-requests/:id - Update imagery request status and details
router.put('/:id', requireAuth, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      admin_notes,
      quote_amount,
      quote_currency
    } = req.body;

    // Validate status if provided
    const validStatuses = ['pending', 'reviewing', 'quoted', 'approved', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        validStatuses
      });
    }

    // Validate quote_amount if provided
    if (quote_amount !== undefined && quote_amount !== null) {
      if (typeof quote_amount !== 'number' || quote_amount < 0) {
        return res.status(400).json({
          error: 'Invalid quote amount',
          message: 'Quote amount must be a positive number'
        });
      }
    }

    // Get the current request to check for status change
    const currentRequest = await ImageryRequest.findById(id);
    if (!currentRequest) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Imagery request not found'
      });
    }

    const oldStatus = currentRequest.status;
    const statusChanged = status && status !== oldStatus;

    // Build update object
    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes;
    }

    if (quote_amount !== undefined) {
      updateData.quote_amount = quote_amount;
    }

    if (quote_currency) {
      updateData.quote_currency = quote_currency.toUpperCase();
    }

    // Set reviewed metadata
    updateData.reviewed_at = new Date();
    updateData.reviewed_by = req.userId;

    // Update the request
    const request = await ImageryRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user_id', 'full_name email company')
      .populate('reviewed_by', 'full_name email')
      .select('-__v');

    if (!request) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Imagery request not found'
      });
    }

    // Send email notification to user on status change
    if (statusChanged) {
      try {
        const { sendImageryRequestStatusUpdate } = require('../../services/emailHelper');
        await sendImageryRequestStatusUpdate(
          request.email,
          request.full_name,
          request,
          oldStatus,
          status
        );
        console.log(`Status update email sent to ${request.email} for request ${request._id}`);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the request update if email fails
      }
    }

    res.json({
      message: 'Imagery request updated successfully',
      request
    });
  } catch (error) {
    console.error('Error updating imagery request:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        error: 'Validation error',
        details: errors
      });
    }

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid request ID',
        message: 'The provided request ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to update imagery request',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
