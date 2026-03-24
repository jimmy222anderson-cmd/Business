const express = require('express');
const router = express.Router();
const FavoriteLocation = require('../../models/FavoriteLocation');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/user/favorite-locations
 * Get user's favorite locations
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await FavoriteLocation.find({ user_id: userId })
      .sort({ last_used_at: -1 })
      .limit(50);

    res.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorite locations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch favorite locations',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/user/favorite-locations
 * Add a new favorite location
 */
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('place_name').trim().notEmpty().withMessage('Place name is required'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('bbox').optional().isArray({ min: 4, max: 4 }).withMessage('Bounding box must have 4 coordinates'),
  body('provider').optional().isIn(['nominatim', 'mapbox', 'manual']).withMessage('Invalid provider')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user._id;
    const { name, place_name, lat, lng, bbox, provider } = req.body;

    // Check if user already has 50 favorites (limit)
    const count = await FavoriteLocation.countDocuments({ user_id: userId });
    if (count >= 50) {
      return res.status(400).json({ 
        error: 'Maximum number of favorite locations reached (50)' 
      });
    }

    // Check for duplicate name
    const existing = await FavoriteLocation.findOne({ user_id: userId, name });
    if (existing) {
      return res.status(400).json({ 
        error: 'A favorite location with this name already exists' 
      });
    }

    const favorite = new FavoriteLocation({
      user_id: userId,
      name,
      place_name,
      lat,
      lng,
      bbox,
      provider: provider || 'manual'
    });

    await favorite.save();

    res.status(201).json({ 
      message: 'Favorite location added successfully',
      favorite 
    });
  } catch (error) {
    console.error('Error adding favorite location:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'A favorite location with this name already exists' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to add favorite location',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/user/favorite-locations/:id
 * Update a favorite location (name only)
 */
router.put('/:id', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user._id;
    const { id } = req.params;
    const { name } = req.body;

    // Check for duplicate name (excluding current favorite)
    const existing = await FavoriteLocation.findOne({ 
      user_id: userId, 
      name,
      _id: { $ne: id }
    });
    
    if (existing) {
      return res.status(400).json({ 
        error: 'A favorite location with this name already exists' 
      });
    }

    const favorite = await FavoriteLocation.findOneAndUpdate(
      { _id: id, user_id: userId },
      { name },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite location not found' });
    }

    res.json({ 
      message: 'Favorite location updated successfully',
      favorite 
    });
  } catch (error) {
    console.error('Error updating favorite location:', error);
    res.status(500).json({ 
      error: 'Failed to update favorite location',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/user/favorite-locations/:id/use
 * Update last_used_at timestamp when a favorite is used
 */
router.put('/:id/use', async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const favorite = await FavoriteLocation.findOneAndUpdate(
      { _id: id, user_id: userId },
      { last_used_at: new Date() },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite location not found' });
    }

    res.json({ favorite });
  } catch (error) {
    console.error('Error updating favorite location usage:', error);
    res.status(500).json({ 
      error: 'Failed to update favorite location',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/user/favorite-locations/:id
 * Delete a favorite location
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const favorite = await FavoriteLocation.findOneAndDelete({ 
      _id: id, 
      user_id: userId 
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite location not found' });
    }

    res.json({ message: 'Favorite location deleted successfully' });
  } catch (error) {
    console.error('Error deleting favorite location:', error);
    res.status(500).json({ 
      error: 'Failed to delete favorite location',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
