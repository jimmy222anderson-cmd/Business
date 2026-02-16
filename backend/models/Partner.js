const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: '/placeholder.svg'
  },
  description: {
    type: String,
    required: true
  },
  website: String,
  category: {
    type: String,
    enum: ['satellite', 'data', 'technology', 'client'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

partnerSchema.index({ status: 1, order: 1 });
partnerSchema.index({ category: 1 });

module.exports = mongoose.model('Partner', partnerSchema);
