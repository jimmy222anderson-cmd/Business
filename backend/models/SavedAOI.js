const mongoose = require('mongoose');

// Sub-schema for AOI center
const aoiCenterSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  lng: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  }
}, { _id: false });

const savedAOISchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'AOI name is required'],
    trim: true,
    maxlength: [100, 'AOI name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // AOI Data
  aoi_type: {
    type: String,
    required: [true, 'AOI type is required'],
    enum: {
      values: ['polygon', 'rectangle', 'circle'],
      message: '{VALUE} is not a valid AOI type'
    }
  },
  aoi_coordinates: {
    type: {
      type: String,
      enum: ['Polygon', 'Point'],
      required: true
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'AOI coordinates are required'],
      validate: {
        validator: function(v) {
          // Basic validation for coordinates array structure
          if (!Array.isArray(v)) return false;
          
          // For Polygon type
          if (this.aoi_coordinates.type === 'Polygon') {
            // Must be array of arrays
            if (!Array.isArray(v[0])) return false;
            // Each coordinate must be [lng, lat]
            return v[0].every(coord => 
              Array.isArray(coord) && 
              coord.length === 2 && 
              typeof coord[0] === 'number' && 
              typeof coord[1] === 'number'
            );
          }
          
          // For Point type (circle center)
          if (this.aoi_coordinates.type === 'Point') {
            return v.length === 2 && 
                   typeof v[0] === 'number' && 
                   typeof v[1] === 'number';
          }
          
          return false;
        },
        message: 'Invalid coordinate format'
      }
    }
  },
  aoi_area_km2: {
    type: Number,
    required: [true, 'AOI area is required'],
    min: [0, 'AOI area must be positive']
  },
  aoi_center: {
    type: aoiCenterSchema,
    required: [true, 'AOI center is required']
  },
  
  // Metadata
  last_used_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for common queries
savedAOISchema.index({ user_id: 1, created_at: -1 });
savedAOISchema.index({ user_id: 1, name: 1 });
savedAOISchema.index({ user_id: 1, last_used_at: -1 });

// Index for geospatial queries (optional, for future use)
savedAOISchema.index({ 'aoi_coordinates': '2dsphere' });

// Compound index to prevent duplicate names per user
savedAOISchema.index({ user_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SavedAOI', savedAOISchema);
