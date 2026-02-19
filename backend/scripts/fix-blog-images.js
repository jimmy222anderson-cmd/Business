/**
 * Script to fix blog post images - update field name from featured_image to featured_image_url
 * Run with: node backend/scripts/fix-blog-images.js YOUR_ADMIN_TOKEN
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN = process.argv[2];

const imageMapping = {
  'future-disaster-response-satellite-imagery': 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200&h=800&fit=crop&q=80',
  'precision-agriculture-satellite-data': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=80',
  'urban-planning-satellite-imagery-smart-cities': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&h=800&fit=crop&q=80',
  'climate-change-monitoring-earth-observation': 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=1200&h=800&fit=crop&q=80'
};

async function fixBlogImages() {
  try {
    if (!ADMIN_TOKEN) {
      console.error('❌ Error: Admin token required!');
      console.log('\nUsage:');
      console.log('node backend/scripts/fix-blog-images.js YOUR_ADMIN_TOKEN');
      process.exit(1);
    }

    console.log('🚀 Fixing blog post images...\n');
    
    // Get all blog posts
    const response = await fetch(`${API_BASE_URL}/admin/blogs`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
    }

    const posts = await response.json();
    console.log(`✅ Found ${posts.length} blog posts\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      if (imageMapping[post.slug]) {
        try {
          console.log(`📝 Updating: ${post.title}`);
          
          const updateResponse = await fetch(`${API_BASE_URL}/admin/blogs/${post._id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${ADMIN_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...post,
              featured_image_url: imageMapping[post.slug]
            })
          });

          if (!updateResponse.ok) {
            throw new Error(`Failed to update: ${updateResponse.statusText}`);
          }

          console.log(`   ✅ Image updated successfully`);
          console.log(`   📍 Image: ${imageMapping[post.slug].substring(0, 60)}...\n`);
          successCount++;
        } catch (error) {
          console.error(`   ❌ Error: ${error.message}\n`);
          errorCount++;
        }
      }
    }

    console.log('='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}\n`);

    if (successCount > 0) {
      console.log('✅ Blog post images have been fixed!');
      console.log('📍 Refresh the blog page to see the images\n');
    }

  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

fixBlogImages();
