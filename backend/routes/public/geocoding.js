const express = require('express');
const router = express.Router();
const geocodingService = require('../../services/geocoding');

/**
 * POST /api/public/geocode
 * Geocode a location search query
 * Supports both forward geocoding (name -> coordinates) and reverse geocoding (coordinates -> name)
 */
router.post('/geocode', async (req, res) => {
  try {
    const { query, provider } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Query parameter is required and must be a non-empty string' 
      });
    }

    // Check if query is coordinates (lat, lng format)
    const coordPattern = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/;
    const coordMatch = query.trim().match(coordPattern);

    if (coordMatch) {
      // Handle coordinate input - reverse geocoding
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);

      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ 
          error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' 
        });
      }

      const result = await geocodingService.reverseGeocode(lat, lng, provider);
      
      if (!result) {
        return res.status(404).json({ 
          error: 'Location not found',
          results: []
        });
      }

      return res.json({ results: [result] });
    }

    // Regular location search (forward geocoding)
    const results = await geocodingService.geocode(query, provider);
    res.json({ results });
  } catch (error) {
    console.error('Geocoding error:', error.message);
    
    res.status(500).json({ 
      error: 'Failed to geocode location',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/public/geocode/reverse
 * Reverse geocoding - convert coordinates to place name
 */
router.post('/reverse', async (req, res) => {
  try {
    const { lat, lng, provider } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ 
        error: 'Latitude and longitude must be numbers' 
      });
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' 
      });
    }

    const result = await geocodingService.reverseGeocode(lat, lng, provider);
    
    if (!result) {
      return res.status(404).json({ 
        error: 'Location not found'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    
    res.status(500).json({ 
      error: 'Failed to reverse geocode location',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/public/geocode/autocomplete
 * Get autocomplete suggestions for location search
 */
router.post('/autocomplete', async (req, res) => {
  try {
    const { query, provider } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Query parameter is required and must be a non-empty string' 
      });
    }

    // Require at least 2 characters for autocomplete
    if (query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await geocodingService.autocomplete(query, provider);
    res.json({ suggestions });
  } catch (error) {
    console.error('Autocomplete error:', error.message);
    
    res.status(500).json({ 
      error: 'Failed to get autocomplete suggestions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
