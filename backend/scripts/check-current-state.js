/**
 * Check current state of sub-products
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_TOKEN = process.argv[2];

async function checkState() {
  try {
    console.log('🔍 Checking current state...\n');
    
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed: ${response.statusText}`);
    }
    
    const products = await response.json();
    const commercial = products.find(p => p.slug === 'commercial-imagery');
    
    if (!commercial) {
      console.log('❌ Commercial Imagery not found');
      return;
    }
    
    console.log(`Product: ${commercial.name}`);
    console.log(`ID: ${commercial._id}\n`);
    
    console.log('Sub-products:');
    commercial.subProducts.forEach((sp, i) => {
      console.log(`\n${i + 1}. ${sp.name}`);
      console.log(`   _id: ${sp._id}`);
      console.log(`   slug: ${sp.slug}`);
      console.log(`   image: ${sp.image || 'UNDEFINED'}`);
      console.log(`   order: ${sp.order}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (!process.argv[2]) {
  console.log('Usage: node check-current-state.js ADMIN_TOKEN');
  process.exit(1);
}

checkState();
