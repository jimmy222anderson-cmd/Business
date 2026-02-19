/**
 * Verify industries were added correctly
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function verifyIndustries() {
  try {
    console.log('🔍 Verifying industries...\n');
    
    const response = await fetch(`${API_BASE_URL}/public/industries`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const industries = await response.json();
    
    console.log(`✅ Total Industries: ${industries.length}\n`);
    
    industries
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((industry, index) => {
        console.log(`${index + 1}. ${industry.name}`);
        console.log(`   Slug: ${industry.slug}`);
        console.log(`   Order: ${industry.order}`);
        console.log(`   Status: ${industry.status}`);
        console.log(`   Use Cases: ${industry.useCases.length}`);
        console.log(`   Image: ${industry.image ? '✅' : '❌'}`);
        if (industry.image) {
          console.log(`   Image URL: ${industry.image.substring(0, 70)}...`);
        }
        console.log('');
      });
    
    console.log('📊 Summary:');
    console.log(`   Total: ${industries.length}`);
    console.log(`   Active: ${industries.filter(i => i.status === 'active').length}`);
    console.log(`   With Images: ${industries.filter(i => i.image && i.image.startsWith('https://')).length}`);
    console.log(`   Total Use Cases: ${industries.reduce((sum, i) => sum + i.useCases.length, 0)}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyIndustries();
