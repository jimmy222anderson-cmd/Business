const mongoose = require('mongoose');

const newsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  subscribed_at: {
    type: Date,
    default: Date.now
  },
  unsubscribed_at: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  }
});

// Unique index on email
newsletterSubscriptionSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);
