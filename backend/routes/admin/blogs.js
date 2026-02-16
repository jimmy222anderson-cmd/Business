const express = require('express');
const router = express.Router();
const { BlogPost } = require('../../models');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// Get all blog posts (admin view - includes drafts)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const posts = await BlogPost.find()
      .populate('author_id', 'full_name email')
      .sort({ created_at: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// Get single blog post
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author_id', 'full_name email');
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

// Create blog post
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author_id: req.user.userId
    };
    const post = new BlogPost(postData);
    await post.save();
    await post.populate('author_id', 'full_name email');
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating blog post:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Blog post with this slug already exists' });
    }
    res.status(500).json({ message: 'Failed to create blog post' });
  }
});

// Update blog post
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author_id', 'full_name email');
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Blog post with this slug already exists' });
    }
    res.status(500).json({ message: 'Failed to update blog post' });
  }
});

// Delete blog post
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
});

module.exports = router;
