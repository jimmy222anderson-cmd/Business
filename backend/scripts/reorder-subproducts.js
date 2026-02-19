/**
 * Script to reorder sub-products with HD first
 * Run with: node backend/scripts/reorder-subproducts.js YOUR_ADMIN_TOKEN
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN = process.argv[2];

// New order: HD first, then VHR, SAR, DOM, DSM, DEM, IR, Hyperspectral
const newOrder = {
  'hd': 1,
  'vhr': 2,
  'sar': 3,
  'dom': 4,
  'dsm': 5,
  'dem': 6,
  'ir': 7,
  'hyperspectral': 8
};

async function reorderSubProducts() {
  try {
    if (!ADMIN_TOKEN) {
      console.error('Error: Admin token required!');
      console.log('\nUsage:');
      console.log('node backend/scripts/reorder-subproducts.js YOUR_ADMIN_TOKEN');
      process.exit(1);
    }

    console.log('🚀 Reordering sub-products...\n');
    
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

    // Update order for each sub-product
    const updatedSubProducts = commercialImagery.subProducts.map(sp => ({
      ...sp,
      order: newOrder[sp.slug] || 99
    }));

    // Sort by new order
    updatedSubProducts.sort((a, b) => a.order - b.order);
    
    console.log('📝 New order:\n');
    updatedSubProducts.forEach((sp, index) => {
      console.log(`   ${index + 1}. ${sp.name} (order: ${sp.order})`);
    });
    console.log('');
    
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

    console.log('✅ Successfully reordered sub-products!\n');
    console.log('📍 New display order:');
    console.log('   1. HD (High Definition)');
    console.log('   2. VHR (Very High Resolution)');
    console.log('   3. SAR (Synthetic Aperture Radar)');
    console.log('   4. DOM (Digital Orthophoto Map)');
    console.log('   5. DSM (Digital Surface Model)');
    console.log('   6. DEM (Digital Elevation Model)');
    console.log('   7. IR (Infrared)');
    console.log('   8. Hyperspectral\n');
    
    console.log('✅ Update completed successfully!\n');
    console.log('📍 Refresh the page to see the new order.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
reorderSubProducts();
