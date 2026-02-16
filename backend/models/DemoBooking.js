const mongoose = require('mongoose');

const demoBookingSchema = new mongoose.Schema({
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
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  preferredDate: {
    type: Date,
    trim: true
  },
  preferredTime: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for performance
demoBookingSchema.index({ email: 1 });
demoBookingSchema.index({ created_at: -1 });
demoBookingSchema.index({ user_id: 1, status: 1 });
demoBookingSchema.index({ status: 1 });

module.exports = mongoose.model('DemoBooking', demoBookingSchema);
