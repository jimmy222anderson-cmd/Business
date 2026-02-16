const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get privacy policy content
router.get('/privacy', async (req, res) => {
  try {
    const content = await Content.findOne({ type: 'privacy-policy' });
    
    if (!content) {
      return res.status(404).json({ error: 'Privacy policy not found' });
    }

    res.json({
      sections: content.sections,
      lastUpdated: content.lastUpdated,
      version: content.version
    });
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    res.status(500).json({ error: 'Failed to fetch privacy policy' });
  }
});

// Get terms of service content
router.get('/terms', async (req, res) => {
  try {
    const content = await Content.findOne({ type: 'terms-of-service' });
    
    if (!content) {
      return res.status(404).json({ error: 'Terms of service not found' });
    }

    res.json({
      sections: content.sections,
      lastUpdated: content.lastUpdated,
      version: content.version
    });
  } catch (error) {
    console.error('Error fetching terms of service:', error);
    res.status(500).json({ error: 'Failed to fetch terms of service' });
  }
});

// Update content (admin only)
router.put('/admin/:type', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { sections, version } = req.body;

    // Validate type
    if (!['privacy-policy', 'terms-of-service'].includes(type)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Validate sections
    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ error: 'Sections must be an array' });
    }

    // Update or create content
    const content = await Content.findOneAndUpdate(
      { type },
      {
        sections,
        version: version || '1.0',
        lastUpdated: new Date()
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      message: 'Content updated successfully',
      content: {
        type: content.type,
        sections: content.sections,
        lastUpdated: content.lastUpdated,
        version: content.version
      }
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

module.exports = router;
