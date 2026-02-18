const mongoose = require('mongoose');

const specificationsSchema = new mongoose.Schema({
  swath_width: {
    type: Number,
    min: 0
  },
  revisit_time: {
    type: Number,
    min: 0
  },
  spectral_bands: {
    type: Number,
    min: 0
  },
  radiometric_resolution: {
    type: Number,
    min: 0
  }
}, { _id: false });

const satelliteProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  provider: {
    type: String,
    required: [true, 'Provider is required'],
    trim: true
  },
  sensor_type: {
    type: String,
    required: [true, 'Sensor type is required'],
    enum: {
      values: ['optical', 'radar', 'thermal'],
      message: '{VALUE} is not a valid sensor type'
    }
  },
  resolution: {
    type: Number,
    required: [true, 'Resolution is required'],
    min: [0, 'Resolution must be a positive number']
  },
  resolution_category: {
    type: String,
    required: [true, 'Resolution category is required'],
    enum: {
      values: ['vhr', 'high', 'medium', 'low'],
      message: '{VALUE} is not a valid resolution category'
    }
  },
  bands: {
    type: [String],
    required: [true, 'At least one band is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one band must be specified'
    }
  },
  coverage: {
    type: String,
    required: [true, 'Coverage is required'],
    trim: true
  },
  availability: {
    type: String,
    required: [true, 'Availability is required'],
    enum: {
      values: ['archive', 'tasking', 'both'],
      message: '{VALUE} is not a valid availability type'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  sample_image_url: {
    type: String,
    default: '/placeholder.svg'
  },
  specifications: {
    type: specificationsSchema,
    default: {}
  },
  pricing_info: {
    type: String,
    default: 'Contact for pricing'
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for common queries
satelliteProductSchema.index({ status: 1, order: 1 });
satelliteProductSchema.index({ resolution_category: 1 });
satelliteProductSchema.index({ sensor_type: 1 });
satelliteProductSchema.index({ provider: 1 });
satelliteProductSchema.index({ availability: 1 });

module.exports = mongoose.model('SatelliteProduct', satelliteProductSchema);
