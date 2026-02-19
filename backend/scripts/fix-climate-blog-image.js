const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BlogPost = require('../models/BlogPost');

async function fixClimateBlogImage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update the Climate Change blog post with a proper backend URL
    // The backend serves static files from /uploads, so we need the full backend URL
    const result = await BlogPost.findOneAndUpdate(
      { slug: 'climate-change-monitoring-earth-observation' },
      { 
        featured_image_url: 'http://localhost:5000/uploads/blog/climate-change-monitoring-earth-observation-1771513847214.gif'
      },
      { new: true }
    );

    if (result) {
      console.log('✅ Updated Climate Change blog post image');
      console.log('   New URL:', result.featured_image_url);
    } else {
      console.log('❌ Blog post not found');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixClimateBlogImage();
