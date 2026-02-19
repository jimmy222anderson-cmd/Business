/**
 * Quick verification script to check sub-product images
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function verifyImages() {
  try {
    console.log('🔍 Verifying sub-product images...\n');
    
    const response = await fetch(`${API_BASE_URL}/public/products/commercial-imagery`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const product = await response.json();
    
    console.log(`Product: ${product.name}`);
    console.log(`Total Sub-Products: ${product.subProducts.length}\n`);
    
    product.subProducts
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((sp, index) => {
        console.log(`${index + 1}. ${sp.name} (${sp.slug})`);
        console.log(`   Order: ${sp.order}`);
        console.log(`   Image: ${sp.image ? '✅ Set' : '❌ Missing'}`);
        if (sp.image) {
          console.log(`   URL: ${sp.image.substring(0, 70)}...`);
        }
        console.log('');
      });
    
    const withImages = product.subProducts.filter(sp => sp.image && sp.image !== '/placeholder.svg').length;
    console.log(`\n✅ ${withImages}/${product.subProducts.length} sub-products have images`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyImages();
