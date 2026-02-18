const express = require('express');
const router = express.Router();
const SatelliteProduct = require('../../models/SatelliteProduct');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { 
  validateObjectId, 
  validateCreateSatelliteProduct, 
  validateUpdateSatelliteProduct 
} = require('../../middleware/validation');

// GET /api/admin/satellite-products - Get all products (including inactive)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      status,
      resolution_category,
      sensor_type,
      availability,
      provider,
      sort = 'order',
      order = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    // Build query (no status filter by default to show all)
    const query = {};

    // Add filters if provided
    if (status) {
      query.status = status;
    }
    if (resolution_category) {
      query.resolution_category = resolution_category;
    }
    if (sensor_type) {
      query.sensor_type = sensor_type;
    }
    if (availability) {
      query.availability = availability;
    }
    if (provider) {
      query.provider = { $regex: provider, $options: 'i' };
    }

    // Build sort object
    const sortObj = {};
    const validSortFields = ['order', 'name', 'provider', 'resolution', 'created_at', 'updated_at', 'status'];
    const sortField = validSortFields.includes(sort) ? sort : 'order';
    sortObj[sortField] = order === 'desc' ? -1 : 1;
    
    // Add secondary sort by created_at for consistency
    if (sortField !== 'created_at') {
      sortObj.created_at = -1;
    }

    // Parse pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [products, total] = await Promise.all([
      SatelliteProduct.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select('-__v')
        .lean(),
      SatelliteProduct.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching satellite products:', error);
    res.status(500).json({ message: 'Failed to fetch satellite products' });
  }
});

// GET /api/admin/satellite-products/:id - Get single product
router.get('/:id', requireAuth, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await SatelliteProduct.findById(id)
      .select('-__v')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching satellite product:', error);
    res.status(500).json({ message: 'Failed to fetch satellite product' });
  }
});

// POST /api/admin/satellite-products - Create new product
router.post('/', requireAuth, requireAdmin, validateCreateSatelliteProduct, async (req, res) => {
  try {
    const product = new SatelliteProduct(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating satellite product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }
    
    res.status(500).json({ message: 'Failed to create satellite product' });
  }
});

// PUT /api/admin/satellite-products/:id - Update product
router.put('/:id', requireAuth, requireAdmin, validateObjectId, validateUpdateSatelliteProduct, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await SatelliteProduct.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating satellite product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }
    
    res.status(500).json({ message: 'Failed to update satellite product' });
  }
});

// DELETE /api/admin/satellite-products/:id - Delete product
router.delete('/:id', requireAuth, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await SatelliteProduct.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ 
      message: 'Satellite product deleted successfully',
      deletedProduct: {
        id: product._id,
        name: product.name
      }
    });
  } catch (error) {
    console.error('Error deleting satellite product:', error);
    res.status(500).json({ message: 'Failed to delete satellite product' });
  }
});

module.exports = router;
