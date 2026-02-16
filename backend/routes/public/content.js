const express = require('express');
const router = express.Router();
const { Product, Industry, Partner, BlogPost } = require('../../models');

// Get all active products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' })
      .sort({ order: 1, created_at: -1 })
      .select('-__v');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get single product by slug
router.get('/products/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug, 
      status: 'active' 
    }).select('-__v');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Get all active industries
router.get('/industries', async (req, res) => {
  try {
    const industries = await Industry.find({ status: 'active' })
      .populate('relevantProducts', 'name slug')
      .sort({ order: 1, created_at: -1 })
      .select('-__v');
    res.json(industries);
  } catch (error) {
    console.error('Error fetching industries:', error);
    res.status(500).json({ message: 'Failed to fetch industries' });
  }
});

// Get single industry by slug
router.get('/industries/:slug', async (req, res) => {
  try {
    const industry = await Industry.findOne({ 
      slug: req.params.slug, 
      status: 'active' 
    })
      .populate('relevantProducts', 'name slug description image pricingBadge')
      .select('-__v');
    
    if (!industry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    res.json(industry);
  } catch (error) {
    console.error('Error fetching industry:', error);
    res.status(500).json({ message: 'Failed to fetch industry' });
  }
});

// Get all active partners
router.get('/partners', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: 'active' };
    if (category) {
      query.category = category;
    }
    
    const partners = await Partner.find(query)
      .sort({ order: 1, created_at: -1 })
      .select('-__v');
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: 'Failed to fetch partners' });
  }
});

// Get all published blog posts
router.get('/blog', async (req, res) => {
  try {
    const posts = await BlogPost.find({ status: 'published' })
      .populate('author_id', 'full_name')
      .sort({ published_at: -1 })
      .select('-__v');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// Get single blog post by slug
router.get('/blog/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    })
      .populate('author_id', 'full_name')
      .select('-__v');
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

module.exports = router;
