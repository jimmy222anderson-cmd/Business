/**
 * Verify blog post images
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function verifyBlogImages() {
  try {
    console.log('🔍 Verifying blog post images...\n');
    
    const response = await fetch(`${API_BASE_URL}/public/blog`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const posts = await response.json();
    
    console.log(`✅ Total Blog Posts: ${posts.length}\n`);
    
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Featured Image URL: ${post.featured_image_url || 'MISSING'}`);
      console.log(`   Has Image: ${!!post.featured_image_url ? '✅' : '❌'}`);
      if (post.featured_image_url) {
        console.log(`   URL: ${post.featured_image_url}`);
      }
      console.log('');
    });
    
    const withImages = posts.filter(p => p.featured_image_url).length;
    console.log(`📊 Summary: ${withImages}/${posts.length} posts have images`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyBlogImages();
