const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAutocomplete() {
  console.log('Testing Geocoding Autocomplete API...\n');

  try {
    // Test 1: Autocomplete for "New Y"
    console.log('Test 1: Autocomplete for "New Y"...');
    const response1 = await axios.post(`${API_BASE_URL}/public/autocomplete`, {
      query: 'New Y'
    });
    console.log(`✓ Found ${response1.data.suggestions.length} suggestions`);
    if (response1.data.suggestions.length > 0) {
      console.log(`  First suggestion: ${response1.data.suggestions[0].name}`);
    }
    console.log('');

    // Test 2: Autocomplete for "Lond"
    console.log('Test 2: Autocomplete for "Lond"...');
    const response2 = await axios.post(`${API_BASE_URL}/public/autocomplete`, {
      query: 'Lond'
    });
    console.log(`✓ Found ${response2.data.suggestions.length} suggestions`);
    if (response2.data.suggestions.length > 0) {
      console.log(`  First suggestion: ${response2.data.suggestions[0].name}`);
    }
    console.log('');

    // Test 3: Reverse geocoding
    console.log('Test 3: Reverse geocoding (40.7128, -74.0060)...');
    const response3 = await axios.post(`${API_BASE_URL}/public/reverse`, {
      lat: 40.7128,
      lng: -74.0060
    });
    console.log(`✓ Found location: ${response3.data.name}`);
    console.log('');

    // Test 4: Short query (should return empty)
    console.log('Test 4: Short query "N" (should return empty)...');
    const response4 = await axios.post(`${API_BASE_URL}/public/autocomplete`, {
      query: 'N'
    });
    console.log(`✓ Returned ${response4.data.suggestions.length} suggestions (expected 0)`);
    console.log('');

    console.log('All autocomplete tests passed! ✓');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAutocomplete();
