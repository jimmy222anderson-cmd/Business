const mongoose = require('mongoose');

const quoteRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    enum: [
      'Financial Services',
      'Agriculture',
      'Energy',
      'Mining',
      'Construction',
      'Government',
      'Environment',
      'Insurance',
      'Other'
    ]
  },
  estimatedDataVolume: {
    type: String,
    required: true,
    enum: [
      '< 1 TB/month',
      '1-10 TB/month',
      '10-50 TB/month',
      '50-100 TB/month',
      '> 100 TB/month',
      'Not sure'
    ]
  },
  requirements: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'quoted', 'accepted', 'declined'],
    default: 'pending'
  },
  quoteDetails: {
    pricing: String,
    terms: String,
    validUntil: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for performance
quoteRequestSchema.index({ email: 1 });
quoteRequestSchema.index({ created_at: -1 });
quoteRequestSchema.index({ user_id: 1, status: 1 });
quoteRequestSchema.index({ status: 1 });

module.exports = mongoose.model('QuoteRequest', quoteRequestSchema);
