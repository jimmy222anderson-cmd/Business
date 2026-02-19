/**
 * Direct MongoDB update to add images to sub-products
 * Run with: node backend/scripts/direct-update-images.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { Product } = require('../models');

// Appropriate satellite/aerial imagery from Unsplash for each sub-product type
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
    console.log('🚀 Connecting to MongoDB...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find Commercial Imagery product
    const product = await Product.findOne({ slug: 'commercial-imagery' });
    
    if (!product) {
      console.error('❌ Commercial Imagery product not found!');
      process.exit(1);
    }
    
    console.log(`✅ Found product: ${product.name}`);
    console.log(`   ID: ${product._id}`);
    console.log(`   Sub-products: ${product.subProducts.length}\n`);
    
    // Update each sub-product with image
    console.log('📝 Updating sub-product images:\n');
    
    product.subProducts.forEach((sp, index) => {
      const imageUrl = imageUrls[sp.slug];
      if (imageUrl) {
        sp.image = imageUrl;
        console.log(`   ${index + 1}. ${sp.name} (${sp.slug})`);
        console.log(`      ✅ Image set: ${imageUrl.substring(0, 60)}...`);
      } else {
        console.log(`   ${index + 1}. ${sp.name} (${sp.slug})`);
        console.log(`      ⚠️  No image URL found for slug: ${sp.slug}`);
      }
      console.log('');
    });
    
    // Save the product
    await product.save();
    console.log('✅ Product saved successfully!\n');
    
    // Verify the update
    const updatedProduct = await Product.findById(product._id);
    const withImages = updatedProduct.subProducts.filter(sp => 
      sp.image && sp.image !== '/placeholder.svg'
    ).length;
    
    console.log('📊 Verification:');
    console.log(`   Total sub-products: ${updatedProduct.subProducts.length}`);
    console.log(`   With images: ${withImages}`);
    console.log('');
    
    if (withImages === updatedProduct.subProducts.length) {
      console.log('✅ All sub-products now have images!');
      console.log('📍 Refresh the frontend to see the images in cards\n');
    } else {
      console.log('⚠️  Some sub-products still missing images');
    }
    
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
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

updateImages();
