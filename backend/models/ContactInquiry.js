const mongoose = require('mongoose');

const contactInquirySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  },
  inquiry_type: {
    type: String,
    enum: ['general', 'partnership', 'product', 'support'],
    required: true
  },
  full_name: {
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
  company: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for performance
contactInquirySchema.index({ status: 1 });
contactInquirySchema.index({ created_at: -1 });

module.exports = mongoose.model('ContactInquiry', contactInquirySchema);
