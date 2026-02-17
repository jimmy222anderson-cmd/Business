const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Fix DNS resolution for MongoDB Atlas on Windows
dns.setDefaultResultOrder('ipv4first');

const BlogPost = require('../models/BlogPost');
const UserProfile = require('../models/UserProfile');

async function testBlogCreate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Find an admin user to use as author
    console.log('Finding admin user...');
    const adminUser = await UserProfile.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('No admin user found! Please create an admin user first.');
      process.exit(1);
    }
    
    console.log('Found admin user:', adminUser.full_name, '(', adminUser.email, ')');

    // Create test blog post
    console.log('Creating test blog post...');
    const testBlogPost = {
      title: 'Test Blog Post - Satellite Technology',
      slug: 'test-blog-post-satellite-technology',
      excerpt: 'This is a test blog post about satellite technology and earth intelligence.',
      content: `# Introduction to Satellite Technology

Satellite technology has revolutionized the way we observe and understand our planet. From weather forecasting to environmental monitoring, satellites provide critical data that helps us make informed decisions.

## Key Benefits

- Real-time monitoring of Earth's surface
- Weather prediction and climate analysis
- Disaster response and management
- Agricultural optimization
- Urban planning and development

## The Future

As technology advances, we can expect even more sophisticated satellite systems that will provide unprecedented insights into our planet's health and changes.`,
      author_id: adminUser._id,
      featured_image_url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
      tags: ['Satellite', 'Technology', 'Earth Intelligence'],
      status: 'published',
      published_at: new Date()
    };

    const blogPost = new BlogPost(testBlogPost);
    await blogPost.save();
    
    console.log('✓ Blog post created successfully!');
    console.log('Blog post ID:', blogPost._id);
    console.log('Title:', blogPost.title);
    console.log('Slug:', blogPost.slug);
    console.log('Status:', blogPost.status);
    console.log('Author:', adminUser.full_name);

    await mongoose.connection.close();
    console.log('\nTest completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating blog post:', error);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the test
testBlogCreate();
