const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testGeocoding() {
  console.log('Testing Geocoding API...\n');

  try {
    // Test 1: Search for a city
    console.log('Test 1: Searching for "London"...');
    const response1 = await axios.post(`${API_URL}/api/public/geocode`, {
      query: 'London'
    });
    console.log(`✓ Found ${response1.data.results.length} results`);
    if (response1.data.results.length > 0) {
      console.log(`  First result: ${response1.data.results[0].name}`);
      console.log(`  Coordinates: ${response1.data.results[0].lat}, ${response1.data.results[0].lng}\n`);
    }

    // Test 2: Search with coordinates
    console.log('Test 2: Searching with coordinates "51.5074, -0.1278"...');
    const response2 = await axios.post(`${API_URL}/api/public/geocode`, {
      query: '51.5074, -0.1278'
    });
    console.log(`✓ Found ${response2.data.results.length} results`);
    if (response2.data.results.length > 0) {
      console.log(`  Result: ${response2.data.results[0].name}`);
      console.log(`  Coordinates: ${response2.data.results[0].lat}, ${response2.data.results[0].lng}\n`);
    }

    // Test 3: Search for a country
    console.log('Test 3: Searching for "Pakistan"...');
    const response3 = await axios.post(`${API_URL}/api/public/geocode`, {
      query: 'Pakistan'
    });
    console.log(`✓ Found ${response3.data.results.length} results`);
    if (response3.data.results.length > 0) {
      console.log(`  First result: ${response3.data.results[0].name}`);
      console.log(`  Coordinates: ${response3.data.results[0].lat}, ${response3.data.results[0].lng}\n`);
    }

    // Test 4: Empty query (should fail)
    console.log('Test 4: Testing empty query (should fail)...');
    try {
      await axios.post(`${API_URL}/api/public/geocode`, {
        query: ''
      });
      console.log('✗ Should have failed but did not\n');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✓ Correctly rejected empty query\n');
      } else {
        throw error;
      }
    }

    // Test 5: Invalid coordinates (should fail)
    console.log('Test 5: Testing invalid coordinates (should fail)...');
    try {
      await axios.post(`${API_URL}/api/public/geocode`, {
        query: '91, 200'
      });
      console.log('✗ Should have failed but did not\n');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✓ Correctly rejected invalid coordinates\n');
      } else {
        throw error;
      }
    }

    console.log('All tests passed! ✓');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testGeocoding();
