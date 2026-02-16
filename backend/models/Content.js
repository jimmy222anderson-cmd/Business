const mongoose = require('mongoose');

const contentSectionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  subsections: [{
    id: String,
    title: String,
    content: String
  }]
}, { _id: false });

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    enum: ['privacy-policy', 'terms-of-service']
  },
  sections: {
    type: [contentSectionSchema],
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  version: {
    type: String,
    required: true,
    default: '1.0'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for faster queries
contentSchema.index({ type: 1 }, { unique: true });

module.exports = mongoose.model('Content', contentSchema);
