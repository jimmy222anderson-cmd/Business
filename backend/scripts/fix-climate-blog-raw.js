/**
 * Fix Climate Change blog post image using raw MongoDB
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function fixClimateBlogImage() {
  try {
    console.log('🚀 Connecting to MongoDB...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');
    
    const db = mongoose.connection.db;
    const collection = db.collection('blogposts');
    
    // Find the blog post
    const blogPost = await collection.findOne({ slug: 'climate-change-monitoring-earth-observation' });
    
    if (!blogPost) {
      console.log('❌ Blog post not found');
      process.exit(1);
    }
    
    console.log(`✅ Found: ${blogPost.title}`);
    console.log(`   Current Image: ${blogPost.featured_image_url}\n`);
    
    // Update with full backend URL
    const newImageUrl = 'http://localhost:5000/uploads/blog/climate-change-monitoring-earth-observation-1771513847214.gif';
    
    console.log('📝 Updating image URL...');
    console.log(`   New URL: ${newImageUrl}\n`);
    
    // Raw update
    const result = await collection.updateOne(
      { _id: blogPost._id },
      { $set: { featured_image_url: newImageUrl } }
    );
    
    console.log(`✅ MongoDB update result:`);
    console.log(`   Matched: ${result.matchedCount}`);
    console.log(`   Modified: ${result.modifiedCount}\n`);
    
    // Verify
    const updated = await collection.findOne({ _id: blogPost._id });
    
    console.log('📊 Verification:');
    console.log(`   Title: ${updated.title}`);
    console.log(`   Image URL: ${updated.featured_image_url}`);
    console.log(`   Has Full URL: ${updated.featured_image_url.startsWith('http') ? '✅' : '❌'}\n`);
    
    if (updated.featured_image_url.startsWith('http')) {
      console.log('🎉 Success! Image URL updated!');
      console.log('📍 Refresh your browser to see the change\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected');
  }
}

fixClimateBlogImage();
