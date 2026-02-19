/**
 * Script to add Unsplash placeholder images to all sub-products
 * Run with: node backend/scripts/add-placeholder-images.js YOUR_ADMIN_TOKEN
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN = process.argv[2];

// Appropriate satellite/aerial imagery from Unsplash for each sub-product type
const imageUrls = {
  // HD - High definition satellite view of Earth
  'hd': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=800&fit=crop&q=80',
  
  // VHR - Very high resolution urban satellite imagery
  'vhr': 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=1200&h=800&fit=crop&q=80',
  
  // SAR - Radar/technical satellite imagery
  'sar': 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&h=800&fit=crop&q=80',
  
  // DOM - Orthophoto aerial map view
  'dom': 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop&q=80',
  
  // DSM - 3D terrain/elevation visualization
  'dsm': 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&h=800&fit=crop&q=80',
  
  // DEM - Topographic/terrain map
  'dem': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&q=80',
  
  // IR - Infrared/thermal imagery (colorful spectrum)
  'ir': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=800&fit=crop&q=80',
  
  // Hyperspectral - Multi-spectral colorful Earth view
  'hyperspectral': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=800&fit=crop&q=80'
};

async function addPlaceholderImages() {
  try {
    if (!ADMIN_TOKEN) {
      console.error('Error: Admin token required!');
      console.log('\nUsage:');
      console.log('node backend/scripts/add-placeholder-images.js YOUR_ADMIN_TOKEN');
      process.exit(1);
    }

    console.log('🚀 Adding placeholder images to sub-products...\n');
    
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

    // Update each sub-product with Unsplash image
    const updatedSubProducts = commercialImagery.subProducts.map(sp => {
      const imageUrl = imageUrls[sp.slug] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop';
      
      // Create a clean object without MongoDB metadata
      const cleanSp = {
        name: sp.name,
        slug: sp.slug,
        description: sp.description,
        longDescription: sp.longDescription,
        image: imageUrl,
        features: sp.features || [],
        specifications: sp.specifications || [],
        order: sp.order
      };
      
      // Include _id if it exists
      if (sp._id) {
        cleanSp._id = sp._id;
      }
      
      return cleanSp;
    });

    console.log('📝 Adding images:\n');
    updatedSubProducts.forEach((sp, index) => {
      console.log(`   ${index + 1}. ${sp.name}`);
      console.log(`      Slug: ${sp.slug}`);
      console.log(`      Image: ${sp.image.substring(0, 60)}...`);
      console.log('');
    });
    
    // Prepare update payload with only necessary fields
    const updatePayload = {
      name: commercialImagery.name,
      slug: commercialImagery.slug,
      description: commercialImagery.description,
      longDescription: commercialImagery.longDescription,
      image: commercialImagery.image,
      pricingBadge: commercialImagery.pricingBadge,
      features: commercialImagery.features,
      useCases: commercialImagery.useCases,
      specifications: commercialImagery.specifications,
      category: commercialImagery.category,
      status: commercialImagery.status,
      order: commercialImagery.order,
      subProducts: updatedSubProducts
    };
    
    const updateResponse = await fetch(`${API_BASE_URL}/admin/products/${commercialImagery._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update product: ${error}`);
    }

    const updatedProduct = await updateResponse.json();
    console.log('\n📊 Verification:');
    console.log(`   Updated product ID: ${updatedProduct._id}`);
    console.log(`   Sub-products count: ${updatedProduct.subProducts.length}`);
    console.log(`   Sub-products with images: ${updatedProduct.subProducts.filter(sp => sp.image && sp.image !== '/placeholder.svg').length}`);
    
    console.log('\n🔍 Detailed check:');
    updatedProduct.subProducts.slice(0, 2).forEach(sp => {
      console.log(`   - ${sp.name}:`);
      console.log(`     Image field: ${sp.image || 'MISSING'}`);
      console.log(`     Has image: ${!!sp.image}`);
    });

    console.log('✅ Successfully added appropriate satellite imagery!\n');
    console.log('📍 All sub-products now have relevant images');
    console.log('📍 Images will display immediately on the frontend\n');
    
    console.log('✅ Update completed successfully!\n');
    console.log('📍 Refresh the page to see images in cards!\n');
    
    console.log('💡 Images used:');
    console.log('   - HD: High-definition Earth satellite view');
    console.log('   - VHR: Urban high-resolution satellite imagery');
    console.log('   - SAR: Radar/technical satellite imagery');
    console.log('   - DOM: Aerial orthophoto map view');
    console.log('   - DSM: 3D terrain elevation visualization');
    console.log('   - DEM: Topographic terrain map');
    console.log('   - IR: Infrared/thermal spectrum imagery');
    console.log('   - Hyperspectral: Multi-spectral Earth view\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
addPlaceholderImages();
