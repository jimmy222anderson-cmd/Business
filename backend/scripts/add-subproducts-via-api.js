/**
 * Script to add sub-products to Commercial Imagery via API
 * Make sure the backend server is running first!
 * Run with: node backend/scripts/add-subproducts-via-api.js
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// You need to get an admin token first
// Run: node backend/scripts/get-admin-token.js
const ADMIN_TOKEN = process.argv[2]; // Pass token as argument

const subProducts = [
  {
    name: 'VHR (Very High Resolution)',
    slug: 'vhr',
    description: 'Sub-meter resolution imagery for detailed analysis and precise measurements. Ideal for urban planning, infrastructure monitoring, and detailed asset inspection.',
    order: 1
  },
  {
    name: 'SAR (Synthetic Aperture Radar)',
    slug: 'sar',
    description: 'All-weather radar imagery that penetrates clouds and works day or night. Perfect for monitoring in challenging weather conditions and detecting ground deformation.',
    order: 2
  },
  {
    name: 'DOM (Digital Orthophoto Map)',
    slug: 'dom',
    description: 'Geometrically corrected aerial photographs with uniform scale. Essential for mapping, GIS applications, and creating accurate base maps.',
    order: 3
  },
  {
    name: 'DSM (Digital Surface Model)',
    slug: 'dsm',
    description: '3D surface elevation data including buildings, vegetation, and infrastructure. Critical for urban modeling, flood analysis, and line-of-sight studies.',
    order: 4
  },
  {
    name: 'DEM (Digital Elevation Model)',
    slug: 'dem',
    description: 'Bare earth terrain elevation data with vegetation and structures removed. Used for hydrological modeling, terrain analysis, and engineering applications.',
    order: 5
  },
  {
    name: 'IR (Infrared)',
    slug: 'ir',
    description: 'Infrared spectrum imagery for thermal analysis and vegetation health monitoring. Valuable for agriculture, environmental monitoring, and heat loss detection.',
    order: 6
  },
  {
    name: 'Hyperspectral',
    slug: 'hyperspectral',
    description: 'Multi-band spectral imaging for material identification and classification. Advanced applications in mineral exploration, precision agriculture, and environmental assessment.',
    order: 7
  }
];

async function addSubProducts() {
  try {
    if (!ADMIN_TOKEN) {
      console.error('Error: Admin token required!');
      console.log('\nUsage:');
      console.log('1. Get admin token: node backend/scripts/get-admin-token.js');
      console.log('2. Run this script: node backend/scripts/add-subproducts-via-api.js YOUR_TOKEN');
      process.exit(1);
    }

    console.log('Fetching Commercial Imagery product...');
    
    // Get all products
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
      console.error('Commercial Imagery product not found!');
      console.log('Please create it first in the admin panel.');
      process.exit(1);
    }

    console.log('✓ Found Commercial Imagery product');
    console.log(`  ID: ${commercialImagery._id}`);
    console.log(`  Name: ${commercialImagery.name}`);

    // Update product with sub-products
    console.log('\nAdding sub-products...');
    
    const updateResponse = await fetch(`${API_BASE_URL}/admin/products/${commercialImagery._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...commercialImagery,
        subProducts: subProducts
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update product: ${error}`);
    }

    console.log('✓ Successfully added sub-products:');
    subProducts.forEach((sp, index) => {
      console.log(`  ${index + 1}. ${sp.name} (${sp.slug})`);
    });

    console.log('\n✓ Script completed successfully!');
    console.log('\nYou can now see these in:');
    console.log('1. Navigation dropdown: Products > Commercial Imagery');
    console.log('2. Product page: /products/commercial-imagery');
    console.log('3. Admin panel: /admin/products (edit Commercial Imagery)');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
addSubProducts();
