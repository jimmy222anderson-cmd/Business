const express = require('express');
const router = express.Router();
const { Industry } = require('../../models');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// Get all industries (admin view)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const industries = await Industry.find()
      .populate('relevantProducts', 'name slug')
      .sort({ order: 1, created_at: -1 });
    res.json(industries);
  } catch (error) {
    console.error('Error fetching industries:', error);
    res.status(500).json({ message: 'Failed to fetch industries' });
  }
});

// Get single industry
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const industry = await Industry.findById(req.params.id)
      .populate('relevantProducts', 'name slug');
    if (!industry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    res.json(industry);
  } catch (error) {
    console.error('Error fetching industry:', error);
    res.status(500).json({ message: 'Failed to fetch industry' });
  }
});

// Create industry
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const industry = new Industry(req.body);
    await industry.save();
    await industry.populate('relevantProducts', 'name slug');
    res.status(201).json(industry);
  } catch (error) {
    console.error('Error creating industry:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Industry with this slug already exists' });
    }
    res.status(500).json({ message: 'Failed to create industry' });
  }
});

// Update industry
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const industry = await Industry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('relevantProducts', 'name slug');
    
    if (!industry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    res.json(industry);
  } catch (error) {
    console.error('Error updating industry:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Industry with this slug already exists' });
    }
    res.status(500).json({ message: 'Failed to update industry' });
  }
});

// Delete industry
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const industry = await Industry.findByIdAndDelete(req.params.id);
    if (!industry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    res.json({ message: 'Industry deleted successfully' });
  } catch (error) {
    console.error('Error deleting industry:', error);
    res.status(500).json({ message: 'Failed to delete industry' });
  }
});

module.exports = router;
