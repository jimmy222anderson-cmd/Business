const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * POST /api/public/geocode
 * Geocode a location search query using Nominatim (OpenStreetMap)
 */
router.post('/geocode', async (req, res) => {
  try {
    const { query } = req.body;

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

      // Reverse geocode to get place name
      const reverseResponse = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'EarthIntelligencePlatform/1.0'
        }
      });

      const result = {
        name: reverseResponse.data.display_name || `${lat}, ${lng}`,
        lat,
        lng,
        bbox: reverseResponse.data.boundingbox ? [
          parseFloat(reverseResponse.data.boundingbox[2]), // west
          parseFloat(reverseResponse.data.boundingbox[0]), // south
          parseFloat(reverseResponse.data.boundingbox[3]), // east
          parseFloat(reverseResponse.data.boundingbox[1])  // north
        ] : undefined
      };

      return res.json({ results: [result] });
    }

    // Regular location search using Nominatim
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 10
      },
      headers: {
        'User-Agent': 'EarthIntelligencePlatform/1.0'
      }
    });

    // Transform Nominatim results to our format
    const results = response.data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      bbox: item.boundingbox ? [
        parseFloat(item.boundingbox[2]), // west
        parseFloat(item.boundingbox[0]), // south
        parseFloat(item.boundingbox[3]), // east
        parseFloat(item.boundingbox[1])  // north
      ] : undefined
    }));

    res.json({ results });
  } catch (error) {
    console.error('Geocoding error:', error.message);
    
    if (error.response) {
      // Nominatim API error
      return res.status(error.response.status).json({ 
        error: 'Geocoding service error',
        message: error.response.data?.error || 'Failed to geocode location'
      });
    }

    res.status(500).json({ 
      error: 'Failed to geocode location',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
