/**
 * Script to fix all sub-products with correct slugs and order
 * Run with: node backend/scripts/fix-all-subproducts.js YOUR_ADMIN_TOKEN
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN = process.argv[2];

async function fixAllSubProducts() {
  try {
    if (!ADMIN_TOKEN) {
      console.error('Error: Admin token required!');
      console.log('\nUsage:');
      console.log('node backend/scripts/fix-all-subproducts.js YOUR_ADMIN_TOKEN');
      process.exit(1);
    }

    console.log('🚀 Fixing all sub-products...\n');
    
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

    // Fix each sub-product
    const fixedSubProducts = commercialImagery.subProducts.map(sp => {
      // Determine correct slug and order based on name
      let slug, order;
      
      if (sp.name.includes('HD') || sp.name.includes('High Definition')) {
        slug = 'hd';
        order = 1;
      } else if (sp.name.includes('VHR') || sp.name.includes('Very High Resolution')) {
        slug = 'vhr';
        order = 2;
      } else if (sp.name.includes('SAR') || sp.name.includes('Synthetic Aperture Radar')) {
        slug = 'sar';
        order = 3;
      } else if (sp.name.includes('DOM') || sp.name.includes('Digital Orthophoto')) {
        slug = 'dom';
        order = 4;
      } else if (sp.name.includes('DSM') || sp.name.includes('Digital Surface')) {
        slug = 'dsm';
        order = 5;
      } else if (sp.name.includes('DEM') || sp.name.includes('Digital Elevation')) {
        slug = 'dem';
        order = 6;
      } else if (sp.name.includes('IR') || sp.name.includes('Infrared')) {
        slug = 'ir';
        order = 7;
      } else if (sp.name.includes('Hyperspectral')) {
        slug = 'hyperspectral';
        order = 8;
      } else {
        slug = sp.slug;
        order = sp.order || 99;
      }

      return {
        ...sp,
        slug: slug,
        order: order
      };
    });

    // Remove duplicates (keep the one with more content)
    const uniqueSubProducts = [];
    const seenSlugs = new Set();
    
    // Sort by content length (longer descriptions first) to keep better versions
    fixedSubProducts.sort((a, b) => {
      const aLength = (a.longDescription || a.description || '').length;
      const bLength = (b.longDescription || b.description || '').length;
      return bLength - aLength;
    });
    
    for (const sp of fixedSubProducts) {
      if (!seenSlugs.has(sp.slug)) {
        uniqueSubProducts.push(sp);
        seenSlugs.add(sp.slug);
      }
    }

    // Sort by order
    uniqueSubProducts.sort((a, b) => a.order - b.order);
    
    console.log('📝 Fixed sub-products:\n');
    uniqueSubProducts.forEach((sp, index) => {
      console.log(`   ${index + 1}. ${sp.name}`);
      console.log(`      Slug: ${sp.slug}`);
      console.log(`      Order: ${sp.order}`);
      console.log(`      Description: ${(sp.longDescription || sp.description || '').substring(0, 50)}...`);
      console.log('');
    });
    
    const updateResponse = await fetch(`${API_BASE_URL}/admin/products/${commercialImagery._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...commercialImagery,
        subProducts: uniqueSubProducts
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update product: ${error}`);
    }

    console.log('✅ Successfully fixed all sub-products!\n');
    console.log(`📍 Total sub-products: ${uniqueSubProducts.length}`);
    console.log('\n📍 Final display order:');
    uniqueSubProducts.forEach((sp, index) => {
      console.log(`   ${index + 1}. ${sp.name} (${sp.slug})`);
    });
    console.log('');
    
    console.log('✅ Update completed successfully!\n');
    console.log('📍 Refresh the page to see the correct order.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
fixAllSubProducts();
