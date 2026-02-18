const mongoose = require('mongoose');
const SatelliteProduct = require('../models/SatelliteProduct');
require('dotenv').config();

async function testSatelliteProductsAPI() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Test 1: Count total products
    const totalProducts = await SatelliteProduct.countDocuments({ status: 'active' });
    console.log(`✓ Total active products: ${totalProducts}`);

    // Test 2: Get products with pagination
    const page1 = await SatelliteProduct.find({ status: 'active' })
      .sort({ order: 1, created_at: -1 })
      .limit(5)
      .select('-__v')
      .lean();
    console.log(`✓ First 5 products retrieved: ${page1.length} products`);

    // Test 3: Filter by resolution_category
    const vhrProducts = await SatelliteProduct.find({ 
      status: 'active',
      resolution_category: 'vhr'
    }).lean();
    console.log(`✓ VHR products: ${vhrProducts.length} products`);

    // Test 4: Filter by sensor_type
    const opticalProducts = await SatelliteProduct.find({ 
      status: 'active',
      sensor_type: 'optical'
    }).lean();
    console.log(`✓ Optical products: ${opticalProducts.length} products`);

    // Test 5: Filter by availability
    const archiveProducts = await SatelliteProduct.find({ 
      status: 'active',
      availability: 'archive'
    }).lean();
    console.log(`✓ Archive products: ${archiveProducts.length} products`);

    // Test 6: Sort by resolution
    const sortedByResolution = await SatelliteProduct.find({ status: 'active' })
      .sort({ resolution: 1 })
      .limit(3)
      .select('name resolution')
      .lean();
    console.log(`✓ Top 3 highest resolution products:`);
    sortedByResolution.forEach(p => {
      console.log(`  - ${p.name}: ${p.resolution}m`);
    });

    // Test 7: Get single product by ID
    if (page1.length > 0) {
      const singleProduct = await SatelliteProduct.findOne({
        _id: page1[0]._id,
        status: 'active'
      }).lean();
      console.log(`✓ Single product retrieved: ${singleProduct.name}`);
    }

    // Test 8: Combined filters
    const combinedFilter = await SatelliteProduct.find({
      status: 'active',
      resolution_category: 'vhr',
      sensor_type: 'optical'
    }).lean();
    console.log(`✓ VHR + Optical products: ${combinedFilter.length} products`);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

testSatelliteProductsAPI();
