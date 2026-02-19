/**
 * Script to add HD sub-product to Commercial Imagery
 * Run with: node backend/scripts/add-hd-subproduct.js YOUR_ADMIN_TOKEN
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN = process.argv[2];

const hdSubProduct = {
  name: 'HD (High Definition)',
  slug: 'hd',
  description: 'High-definition satellite imagery with enhanced clarity and detail. Perfect for detailed mapping, urban analysis, and infrastructure assessment.',
  longDescription: 'High Definition (HD) satellite imagery represents the next generation of Earth observation, combining advanced sensor technology with sophisticated image processing to deliver exceptional clarity and detail. HD imagery bridges the gap between standard resolution and very high resolution products, offering an optimal balance of coverage area, detail level, and cost-effectiveness.\n\nHD imagery is particularly well-suited for regional mapping projects, where the combination of good spatial resolution and wide area coverage enables efficient data collection. Urban planners use HD imagery to assess neighborhood-scale development, monitor land use changes, and plan infrastructure improvements. The enhanced clarity reveals building structures, road networks, and vegetation patterns with sufficient detail for most planning applications.\n\nIn environmental monitoring, HD imagery supports habitat mapping, forest inventory, and agricultural assessment at scales that balance detail with practical coverage. The imagery quality enables identification of major land cover types, detection of significant changes, and monitoring of environmental conditions across large areas. For disaster response and emergency management, HD imagery provides rapid assessment capabilities with sufficient detail to guide initial response efforts and damage evaluation.',
  image: '/uploads/products/commercial-imagery-hd.jpg',
  order: 8,
  features: [
    {
      title: 'Enhanced Clarity',
      description: 'Superior image quality with enhanced detail and sharpness',
      icon: 'eye'
    },
    {
      title: 'Wide Coverage',
      description: 'Optimal balance between detail and area coverage',
      icon: 'maximize'
    },
    {
      title: 'Cost-Effective',
      description: 'Affordable solution for large-area mapping projects',
      icon: 'dollar-sign'
    }
  ],
  specifications: [
    { key: 'Resolution', value: '1 - 2', unit: 'meters' },
    { key: 'Spectral Bands', value: 'RGB + NIR', unit: '' },
    { key: 'Swath Width', value: '20 - 50', unit: 'km' },
    { key: 'Revisit Time', value: '3 - 5', unit: 'days' },
    { key: 'Positional Accuracy', value: '< 10', unit: 'meters CE90' }
  ]
};

async function addHDSubProduct() {
  try {
    if (!ADMIN_TOKEN) {
      console.error('Error: Admin token required!');
      console.log('\nUsage:');
      console.log('node backend/scripts/add-hd-subproduct.js YOUR_ADMIN_TOKEN');
      process.exit(1);
    }

    console.log('🚀 Adding HD sub-product to Commercial Imagery...\n');
    
    // Get all products
    console.log('📡 Fetching products...');
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const products = await response.json();
    const commercialImagery = products.find(p => p.slug === 'commercial-imagery');

    if (!commercialImagery) {
      console.error('❌ Commercial Imagery product not found!');
      process.exit(1);
    }

    console.log('✅ Found Commercial Imagery product');
    console.log(`   ID: ${commercialImagery._id}`);
    console.log(`   Current sub-products: ${commercialImagery.subProducts?.length || 0}\n`);

    // Add HD to existing sub-products
    const updatedSubProducts = [...(commercialImagery.subProducts || []), hdSubProduct];
    
    console.log('📝 Adding HD sub-product...\n');
    
    const updateResponse = await fetch(`${API_BASE_URL}/admin/products/${commercialImagery._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...commercialImagery,
        subProducts: updatedSubProducts
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update product: ${error}`);
    }

    console.log('✅ Successfully added HD sub-product!\n');
    console.log('HD (High Definition)');
    console.log(`   Slug: ${hdSubProduct.slug}`);
    console.log(`   Image: ${hdSubProduct.image}`);
    console.log(`   Features: ${hdSubProduct.features.length}`);
    console.log(`   Specifications: ${hdSubProduct.specifications.length}`);
    console.log(`   Description length: ${hdSubProduct.longDescription.length} chars\n`);

    console.log('✅ Update completed successfully!\n');
    console.log('📍 Total sub-products now: ' + updatedSubProducts.length);
    console.log('\n📍 You can now view HD at:');
    console.log('   1. Product page: /products/commercial-imagery');
    console.log('   2. Sub-product page: /products/commercial-imagery/hd');
    console.log('   3. Admin panel: /admin/products (edit Commercial Imagery)\n');
    
    console.log('⚠️  Note: Upload actual image via admin panel.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
addHDSubProduct();
