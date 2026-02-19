/**
 * Script to fix sub-product order with HD first
 * Run with: node backend/scripts/fix-subproduct-order.js YOUR_ADMIN_TOKEN
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN = process.argv[2];

async function fixSubProductOrder() {
  try {
    if (!ADMIN_TOKEN) {
      console.error('Error: Admin token required!');
      console.log('\nUsage:');
      console.log('node backend/scripts/fix-subproduct-order.js YOUR_ADMIN_TOKEN');
      process.exit(1);
    }

    console.log('🚀 Fixing sub-product order...\n');
    
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
    console.log(`   ID: ${commercialImagery._id}\n`);

    console.log('Current sub-products:');
    commercialImagery.subProducts.forEach((sp, index) => {
      console.log(`   ${index + 1}. ${sp.name} (slug: ${sp.slug}, order: ${sp.order})`);
    });
    console.log('');

    // Update each sub-product with correct order
    const updatedSubProducts = commercialImagery.subProducts.map(sp => {
      let newOrder;
      switch(sp.slug) {
        case 'hd': newOrder = 1; break;
        case 'vhr': newOrder = 2; break;
        case 'sar': newOrder = 3; break;
        case 'dom': newOrder = 4; break;
        case 'dsm': newOrder = 5; break;
        case 'dem': newOrder = 6; break;
        case 'ir': newOrder = 7; break;
        case 'hyperspectral': newOrder = 8; break;
        default: newOrder = 99;
      }
      return {
        ...sp,
        order: newOrder
      };
    });

    // Sort by new order
    updatedSubProducts.sort((a, b) => a.order - b.order);
    
    console.log('📝 New order:\n');
    updatedSubProducts.forEach((sp, index) => {
      console.log(`   ${index + 1}. ${sp.name} (slug: ${sp.slug}, order: ${sp.order})`);
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

    console.log('✅ Successfully fixed sub-product order!\n');
    console.log('📍 Final display order:');
    console.log('   1. HD (High Definition)');
    console.log('   2. VHR (Very High Resolution)');
    console.log('   3. SAR (Synthetic Aperture Radar)');
    console.log('   4. DOM (Digital Orthophoto Map)');
    console.log('   5. DSM (Digital Surface Model)');
    console.log('   6. DEM (Digital Elevation Model)');
    console.log('   7. IR (Infrared)');
    console.log('   8. Hyperspectral\n');
    
    console.log('✅ Update completed successfully!\n');
    console.log('📍 Refresh the page to see HD first.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
fixSubProductOrder();
