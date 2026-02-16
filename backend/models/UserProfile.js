const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password_hash: {
    type: String,
    required: true
  },
  // Password history for preventing reuse (stores last 5 password hashes)
  password_history: {
    type: [String],
    default: []
  },
  full_name: {
    type: String,
    trim: true
  },
  company_name: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  phone_number: {
    type: String,
    trim: true
  },
  job_title: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Password reset fields
  password_reset_token: {
    type: String,
    default: null
  },
  password_reset_expires: {
    type: Date,
    default: null
  },
  // Email verification fields
  email_verified: {
    type: Boolean,
    default: false
  },
  email_verification_token: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for faster queries
userProfileSchema.index({ email: 1 });

// Don't return password hash in JSON responses
userProfileSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password_hash;
    return ret;
  }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
