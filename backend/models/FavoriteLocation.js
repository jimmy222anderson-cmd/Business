const mongoose = require('mongoose');

const favoriteLocationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  place_name: {
    type: String,
    required: true,
    trim: true
  },
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  bbox: {
    type: [Number],
    validate: {
      validator: function(v) {
        return !v || v.length === 4;
      },
      message: 'Bounding box must have exactly 4 coordinates [west, south, east, north]'
    }
  },
  provider: {
    type: String,
    enum: ['nominatim', 'mapbox', 'manual'],
    default: 'nominatim'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_used_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for user_id and name to prevent duplicates
favoriteLocationSchema.index({ user_id: 1, name: 1 }, { unique: true });

// Index for sorting by last used
favoriteLocationSchema.index({ user_id: 1, last_used_at: -1 });

const FavoriteLocation = mongoose.model('FavoriteLocation', favoriteLocationSchema);

module.exports = FavoriteLocation;
