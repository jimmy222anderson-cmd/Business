const mongoose = require('mongoose');

const productInquirySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  },
  product_id: {
    type: String,
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
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'quoted', 'ordered', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for performance
productInquirySchema.index({ user_id: 1 });
productInquirySchema.index({ product_id: 1 });
productInquirySchema.index({ created_at: -1 });

module.exports = mongoose.model('ProductInquiry', productInquirySchema);
