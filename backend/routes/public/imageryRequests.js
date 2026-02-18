const express = require('express');
const router = express.Router();
const ImageryRequest = require('../../models/ImageryRequest');
const { validateImageryRequest } = require('../../middleware/validation');
const { calculateAreaFromCoordinates } = require('../../utils/geoUtils');
const { optionalAuth } = require('../../middleware/auth');
const { sendImageryRequestConfirmation, sendImageryRequestNotification } = require('../../services/emailHelper');

// POST /api/public/imagery-requests - Submit imagery request
router.post('/', optionalAuth, validateImageryRequest, async (req, res) => {
  try {
    const {
      full_name,
      email,
      company,
      phone,
      aoi_type,
      aoi_coordinates,
      aoi_area_km2,
      aoi_center,
      date_range,
      filters,
      urgency,
      additional_requirements
    } = req.body;

    // Calculate area from coordinates if not provided or validate provided area
    let calculatedArea = aoi_area_km2;
    if (aoi_coordinates && aoi_coordinates.type === 'Polygon') {
      calculatedArea = calculateAreaFromCoordinates(aoi_coordinates.coordinates);
      
      // If area was provided, check if it's reasonably close to calculated area
      if (aoi_area_km2 && Math.abs(aoi_area_km2 - calculatedArea) / calculatedArea > 0.1) {
        console.warn(`Provided area (${aoi_area_km2}) differs significantly from calculated area (${calculatedArea})`);
      }
    }

    // Create imagery request
    const imageryRequest = new ImageryRequest({
      user_id: req.user ? req.user._id : null, // Set user_id if authenticated
      full_name,
      email,
      company,
      phone,
      aoi_type,
      aoi_coordinates,
      aoi_area_km2: calculatedArea,
      aoi_center,
      date_range,
      filters: filters || {},
      urgency: urgency || 'standard',
      additional_requirements,
      status: 'pending'
    });

    await imageryRequest.save();

    // Send confirmation email to user
    try {
      await sendImageryRequestConfirmation(email, full_name, imageryRequest);
      console.log('Confirmation email sent to user:', email);
    } catch (emailError) {
      console.error('Failed to send confirmation email to user:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await sendImageryRequestNotification(imageryRequest);
      console.log('Notification email sent to admin');
    } catch (emailError) {
      console.error('Failed to send notification email to admin:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Imagery request submitted successfully',
      request_id: imageryRequest._id,
      request: {
        id: imageryRequest._id,
        status: imageryRequest.status,
        aoi_area_km2: imageryRequest.aoi_area_km2,
        created_at: imageryRequest.created_at
      }
    });
  } catch (error) {
    console.error('Error creating imagery request:', error);
    
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

    res.status(500).json({ 
      error: 'Failed to submit imagery request',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
