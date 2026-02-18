const express = require('express');
const router = express.Router();
const SatelliteProduct = require('../../models/SatelliteProduct');
const { validateObjectId } = require('../../middleware/validation');

// GET /api/public/satellite-products - List with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      resolution_category,
      sensor_type,
      availability,
      sort = 'order',
      order = 'asc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query for active products only
    const query = { status: 'active' };

    // Add filters if provided
    if (resolution_category) {
      query.resolution_category = resolution_category;
    }
    if (sensor_type) {
      query.sensor_type = sensor_type;
    }
    if (availability) {
      query.availability = availability;
    }

    // Build sort object
    const sortObj = {};
    const validSortFields = ['order', 'name', 'provider', 'resolution', 'created_at'];
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

// GET /api/public/satellite-products/:id - Get single product
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await SatelliteProduct.findOne({
      _id: id,
      status: 'active'
    })
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

module.exports = router;
