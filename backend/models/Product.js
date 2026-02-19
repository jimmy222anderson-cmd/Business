const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  }
}, { _id: false });

const useCaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  industry: String
}, { _id: false });

const specificationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  unit: String
}, { _id: false });

const subProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  description: String,
  longDescription: String,
  image: String,  // Removed default value to allow explicit setting
  features: [featureSchema],
  specifications: [specificationSchema],
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: '/placeholder.svg'
  },
  pricingBadge: String,
  features: [featureSchema],
  useCases: [useCaseSchema],
  specifications: [specificationSchema],
  subProducts: [subProductSchema],
  category: {
    type: String,
    enum: ['analytics', 'imagery', 'data', 'plugin'],
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

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ status: 1, order: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
