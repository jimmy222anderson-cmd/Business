/**
 * Raw MongoDB update bypassing Mongoose
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

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
    console.log('✅ Connected\n');
    
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    // Find the product
    const product = await collection.findOne({ slug: 'commercial-imagery' });
    
    if (!product) {
      console.log('❌ Product not found');
      process.exit(1);
    }
    
    console.log(`✅ Found: ${product.name}\n`);
    
    // Update sub-products with images
    const updatedSubProducts = product.subProducts.map(sp => {
      const imageUrl = imageUrls[sp.slug];
      return {
        ...sp,
        image: imageUrl || '/placeholder.svg'
      };
    });
    
    console.log('📝 Updating with raw MongoDB:\n');
    updatedSubProducts.forEach((sp, i) => {
      console.log(`   ${i + 1}. ${sp.name}`);
      console.log(`      Image: ${sp.image.substring(0, 65)}...`);
    });
    
    // Raw update
    const result = await collection.updateOne(
      { _id: product._id },
      { $set: { subProducts: updatedSubProducts } }
    );
    
    console.log(`\n✅ MongoDB update result:`);
    console.log(`   Matched: ${result.matchedCount}`);
    console.log(`   Modified: ${result.modifiedCount}\n`);
    
    // Verify
    const updated = await collection.findOne({ _id: product._id });
    
    console.log('📊 Verification:');
    updated.subProducts.forEach((sp, i) => {
      const hasImage = sp.image && sp.image.startsWith('https://');
      console.log(`   ${i + 1}. ${sp.name}: ${hasImage ? '✅' : '❌'} ${sp.image || 'NO IMAGE'}`);
    });
    
    const withImages = updated.subProducts.filter(sp => 
      sp.image && sp.image.startsWith('https://')
    ).length;
    
    console.log(`\n📍 ${withImages}/${updated.subProducts.length} sub-products have images`);
    
    if (withImages === updated.subProducts.length) {
      console.log('\n🎉 Success! All images added!');
      console.log('📍 Refresh your browser to see them\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected');
  }
}

updateImages();
