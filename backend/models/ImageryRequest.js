const mongoose = require('mongoose');

// Sub-schema for date range
const dateRangeSchema = new mongoose.Schema({
  start_date: {
    type: Date,
    required: [true, 'Start date is required']
  },
  end_date: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(v) {
        return v >= this.start_date;
      },
      message: 'End date must be after or equal to start date'
    }
  }
}, { _id: false });

// Sub-schema for filters
const filtersSchema = new mongoose.Schema({
  resolution_category: {
    type: [String],
    enum: {
      values: ['vhr', 'high', 'medium', 'low'],
      message: '{VALUE} is not a valid resolution category'
    },
    default: []
  },
  max_cloud_coverage: {
    type: Number,
    min: [0, 'Cloud coverage must be between 0 and 100'],
    max: [100, 'Cloud coverage must be between 0 and 100']
  },
  providers: {
    type: [String],
    default: []
  },
  bands: {
    type: [String],
    default: []
  },
  image_types: {
    type: [String],
    enum: {
      values: ['optical', 'radar', 'thermal'],
      message: '{VALUE} is not a valid image type'
    },
    default: []
  }
}, { _id: false });

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

const imageryRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    default: null,
    index: true
  },
  
  // Contact Information
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  company: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
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
  
  // Request Parameters
  date_range: {
    type: dateRangeSchema,
    required: [true, 'Date range is required']
  },
  filters: {
    type: filtersSchema,
    default: {}
  },
  
  // Additional Details
  urgency: {
    type: String,
    required: [true, 'Urgency level is required'],
    enum: {
      values: ['standard', 'urgent', 'emergency'],
      message: '{VALUE} is not a valid urgency level'
    },
    default: 'standard'
  },
  additional_requirements: {
    type: String,
    trim: true
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: {
      values: ['pending', 'reviewing', 'quoted', 'approved', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending',
    index: true
  },
  status_history: [{
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'quoted', 'approved', 'completed', 'cancelled'],
      required: true
    },
    changed_at: {
      type: Date,
      default: Date.now,
      required: true
    },
    changed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile'
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  admin_notes: {
    type: String,
    trim: true
  },
  quote_amount: {
    type: Number,
    min: [0, 'Quote amount must be positive']
  },
  quote_currency: {
    type: String,
    trim: true,
    uppercase: true,
    default: 'USD'
  },
  
  // Metadata
  reviewed_at: {
    type: Date
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for common queries
imageryRequestSchema.index({ user_id: 1, created_at: -1 });
imageryRequestSchema.index({ status: 1, created_at: -1 });
imageryRequestSchema.index({ created_at: -1 });
imageryRequestSchema.index({ email: 1 });

// Index for geospatial queries (optional, for future use)
imageryRequestSchema.index({ 'aoi_coordinates': '2dsphere' });

// Pre-save middleware to track status changes
imageryRequestSchema.pre('save', function() {
  // Only track status changes if status field is modified
  if (this.isModified('status')) {
    // Initialize status_history if it doesn't exist
    if (!this.status_history) {
      this.status_history = [];
    }
    
    // Add new status to history
    this.status_history.push({
      status: this.status,
      changed_at: new Date(),
      changed_by: this.reviewed_by,
      notes: this.admin_notes
    });
  }
});

module.exports = mongoose.model('ImageryRequest', imageryRequestSchema);
