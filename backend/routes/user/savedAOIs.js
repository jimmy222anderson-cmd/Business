const express = require('express');
const router = express.Router();
const SavedAOI = require('../../models/SavedAOI');
const { requireAuth } = require('../../middleware/auth');
const { validateObjectId } = require('../../middleware/validation');

// Maximum number of saved AOIs per user
const MAX_SAVED_AOIS = 50;

/**
 * GET /api/user/saved-aois
 * Get all saved AOIs for the authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const {
      sort = 'created_at',
      order = 'desc',
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build query
    const query = { user_id: req.userId };

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    const validSortFields = ['created_at', 'updated_at', 'name', 'last_used_at', 'aoi_area_km2'];
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
    const [aois, total] = await Promise.all([
      SavedAOI.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select('-__v')
        .lean(),
      SavedAOI.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      aois,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching saved AOIs:', error);
    res.status(500).json({
      error: 'Failed to fetch saved AOIs',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/user/saved-aois/:id
 * Get a single saved AOI by ID
 */
router.get('/:id', requireAuth, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;

    const aoi = await SavedAOI.findOne({
      _id: id,
      user_id: req.userId
    })
      .select('-__v')
      .lean();

    if (!aoi) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Saved AOI not found'
      });
    }

    res.json({ aoi });
  } catch (error) {
    console.error('Error fetching saved AOI:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid AOI ID',
        message: 'The provided AOI ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch saved AOI',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/user/saved-aois
 * Create a new saved AOI
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      aoi_type,
      aoi_coordinates,
      aoi_area_km2,
      aoi_center
    } = req.body;

    // Check if user has reached the maximum number of saved AOIs
    const count = await SavedAOI.countDocuments({ user_id: req.userId });
    if (count >= MAX_SAVED_AOIS) {
      return res.status(400).json({
        error: 'Limit reached',
        message: `You can only save up to ${MAX_SAVED_AOIS} AOIs. Please delete some before adding new ones.`,
        maxLimit: MAX_SAVED_AOIS,
        currentCount: count
      });
    }

    // Check for duplicate name
    const existingAOI = await SavedAOI.findOne({
      user_id: req.userId,
      name: name
    });

    if (existingAOI) {
      return res.status(400).json({
        error: 'Duplicate name',
        message: 'You already have a saved AOI with this name. Please choose a different name.'
      });
    }

    // Create new saved AOI
    const savedAOI = new SavedAOI({
      user_id: req.userId,
      name,
      description,
      aoi_type,
      aoi_coordinates,
      aoi_area_km2,
      aoi_center,
      last_used_at: new Date()
    });

    await savedAOI.save();

    res.status(201).json({
      message: 'AOI saved successfully',
      aoi: savedAOI
    });
  } catch (error) {
    console.error('Error saving AOI:', error);

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

    // Handle duplicate key error (unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate name',
        message: 'You already have a saved AOI with this name. Please choose a different name.'
      });
    }

    res.status(500).json({
      error: 'Failed to save AOI',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/user/saved-aois/:id
 * Update a saved AOI (name and description only)
 */
router.put('/:id', requireAuth, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Build update object (only allow updating name and description)
    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No updates provided',
        message: 'Please provide name or description to update'
      });
    }

    // Check for duplicate name if name is being updated
    if (name) {
      const existingAOI = await SavedAOI.findOne({
        user_id: req.userId,
        name: name,
        _id: { $ne: id }
      });

      if (existingAOI) {
        return res.status(400).json({
          error: 'Duplicate name',
          message: 'You already have a saved AOI with this name. Please choose a different name.'
        });
      }
    }

    // Update the AOI
    const aoi = await SavedAOI.findOneAndUpdate(
      { _id: id, user_id: req.userId },
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!aoi) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Saved AOI not found'
      });
    }

    res.json({
      message: 'AOI updated successfully',
      aoi
    });
  } catch (error) {
    console.error('Error updating saved AOI:', error);

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

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate name',
        message: 'You already have a saved AOI with this name. Please choose a different name.'
      });
    }

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid AOI ID',
        message: 'The provided AOI ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to update saved AOI',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/user/saved-aois/:id
 * Delete a saved AOI
 */
router.delete('/:id', requireAuth, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;

    const aoi = await SavedAOI.findOneAndDelete({
      _id: id,
      user_id: req.userId
    });

    if (!aoi) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Saved AOI not found'
      });
    }

    res.json({
      message: 'AOI deleted successfully',
      deletedAOI: {
        id: aoi._id,
        name: aoi.name
      }
    });
  } catch (error) {
    console.error('Error deleting saved AOI:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid AOI ID',
        message: 'The provided AOI ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to delete saved AOI',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/user/saved-aois/:id/use
 * Update the last_used_at timestamp when an AOI is loaded
 */
router.put('/:id/use', requireAuth, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;

    const aoi = await SavedAOI.findOneAndUpdate(
      { _id: id, user_id: req.userId },
      { last_used_at: new Date() },
      { new: true }
    ).select('-__v');

    if (!aoi) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Saved AOI not found'
      });
    }

    res.json({
      message: 'AOI usage updated',
      aoi
    });
  } catch (error) {
    console.error('Error updating AOI usage:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid AOI ID',
        message: 'The provided AOI ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to update AOI usage',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
