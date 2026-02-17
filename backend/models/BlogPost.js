const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true
  },
  featured_image_url: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  published_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for performance
blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ status: 1, published_at: -1 });
blogPostSchema.index({ tags: 1 });

// Auto-set published_at when status changes to published
blogPostSchema.pre('save', async function() {
  if (this.isModified('status') && this.status === 'published' && !this.published_at) {
    this.published_at = new Date();
  }
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
