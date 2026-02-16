const express = require('express');
const router = express.Router();
const { Partner } = require('../../models');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// Get all partners (admin view)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const partners = await Partner.find().sort({ order: 1, created_at: -1 });
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: 'Failed to fetch partners' });
  }
});

// Get single partner
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json(partner);
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ message: 'Failed to fetch partner' });
  }
});

// Create partner
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const partner = new Partner(req.body);
    await partner.save();
    res.status(201).json(partner);
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ message: 'Failed to create partner' });
  }
});

// Update partner
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json(partner);
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ message: 'Failed to update partner' });
  }
});

// Delete partner
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ message: 'Failed to delete partner' });
  }
});

module.exports = router;
