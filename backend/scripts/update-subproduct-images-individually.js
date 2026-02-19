/**
 * Update sub-product images one by one
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_TOKEN = process.argv[2];

const imageUrls = {
  'hd': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=800&fit=crop&q=80',
  'vhr': 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=1200&h=800&fit=crop&q=80',
  'sar': 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&h=800&fit=crop&q=80',
  'dom': 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop&q=80',
  'dsm': 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&h=800&fit=crop&q=80',
  'dem': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&q=80',
  'ir': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=800&fit=crop&q=80',
  'hyperspectral': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=800&fit=crop&q=80'
};

async function updateImages() {
  try {
    if (!ADMIN_TOKEN) {
      console.log('Usage: node update-subproduct-images-individually.js ADMIN_TOKEN');
      process.exit(1);
    }

    console.log('🚀 Updating sub-product images...\n');
    
    // Get the product
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    
    if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
    
    const products = await response.json();
    const commercial = products.find(p => p.slug === 'commercial-imagery');
    
    if (!commercial) {
      console.log('❌ Commercial Imagery not found');
      process.exit(1);
    }
    
    console.log(`✅ Found: ${commercial.name} (${commercial._id})\n`);
    
    // Update all sub-products at once with explicit image values
    const updatedSubProducts = commercial.subProducts.map(sp => {
      const imageUrl = imageUrls[sp.slug];
      return {
        _id: sp._id,
        name: sp.name,
        slug: sp.slug,
        description: sp.description || '',
        longDescription: sp.longDescription || '',
        image: imageUrl || '/placeholder.svg',  // Explicitly set image
        features: sp.features || [],
        specifications: sp.specifications || [],
        order: sp.order || 0
      };
    });
    
    console.log('📝 Preparing update with images:\n');
    updatedSubProducts.forEach((sp, i) => {
      console.log(`   ${i + 1}. ${sp.name}`);
      console.log(`      Image: ${sp.image.substring(0, 65)}...`);
    });
    
    // Update the entire product
    const updateResponse = await fetch(`${API_BASE_URL}/admin/products/${commercial._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: commercial.name,
        slug: commercial.slug,
        description: commercial.description,
        longDescription: commercial.longDescription,
        image: commercial.image,
        pricingBadge: commercial.pricingBadge,
        features: commercial.features,
        useCases: commercial.useCases,
        specifications: commercial.specifications,
        category: commercial.category,
        status: commercial.status,
        order: commercial.order,
        subProducts: updatedSubProducts
      })
    });
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Update failed: ${error}`);
    }
    
    const updated = await updateResponse.json();
    
    console.log('\n✅ Update completed!\n');
    
    // Verify
    console.log('📊 Verification:');
    updated.subProducts.forEach((sp, i) => {
      const hasImage = sp.image && sp.image !== '/placeholder.svg' && sp.image !== 'UNDEFINED';
      console.log(`   ${i + 1}. ${sp.name}: ${hasImage ? '✅' : '❌'} ${sp.image || 'NO IMAGE'}`);
    });
    
    const withImages = updated.subProducts.filter(sp => 
      sp.image && sp.image !== '/placeholder.svg'
    ).length;
    
    console.log(`\n📍 ${withImages}/${updated.subProducts.length} sub-products have images`);
    
    if (withImages === updated.subProducts.length) {
      console.log('\n🎉 Success! All sub-products now have appropriate satellite imagery!');
      console.log('📍 Refresh your browser to see the images\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

updateImages();
