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

module.exports = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);
