/**
 * Test script for imagery request API endpoint
 * Tests validation, area calculation, and request submission
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Test data
const validRequest = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  company: 'Test Company',
  phone: '+1-234-567-8900',
  aoi_type: 'polygon',
  aoi_coordinates: {
    type: 'Polygon',
    coordinates: [[
      [-122.4194, 37.7749], // San Francisco area
      [-122.4194, 37.8049],
      [-122.3894, 37.8049],
      [-122.3894, 37.7749],
      [-122.4194, 37.7749]
    ]]
  },
  aoi_area_km2: 10.5,
  aoi_center: {
    lat: 37.7899,
    lng: -122.4044
  },
  date_range: {
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  filters: {
    resolution_category: ['vhr', 'high'],
    max_cloud_coverage: 20,
    providers: ['Maxar', 'Planet Labs'],
    bands: ['RGB', 'NIR'],
    image_types: ['optical']
  },
  urgency: 'standard',
  additional_requirements: 'Need high-quality imagery for urban planning analysis'
};

const invalidRequests = [
  {
    name: 'Missing required fields',
    data: {
      email: 'test@example.com'
    }
  },
  {
    name: 'Invalid email',
    data: {
      ...validRequest,
      email: 'invalid-email'
    }
  },
  {
    name: 'Invalid AOI type',
    data: {
      ...validRequest,
      aoi_type: 'invalid_type'
    }
  },
  {
    name: 'Invalid coordinates',
    data: {
      ...validRequest,
      aoi_coordinates: {
        type: 'Polygon',
        coordinates: 'invalid'
      }
    }
  },
  {
    name: 'Invalid date range',
    data: {
      ...validRequest,
      date_range: {
        start_date: '2024-12-31',
        end_date: '2024-01-01'
      }
    }
  },
  {
    name: 'Invalid urgency',
    data: {
      ...validRequest,
      urgency: 'super_urgent'
    }
  },
  {
    name: 'Invalid cloud coverage',
    data: {
      ...validRequest,
      filters: {
        ...validRequest.filters,
        max_cloud_coverage: 150
      }
    }
  }
];

async function testValidRequest() {
  console.log('\n=== Testing Valid Request ===');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/public/imagery-requests`,
      validRequest
    );
    console.log('✓ Valid request accepted');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('✗ Valid request failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

async function testInvalidRequests() {
  console.log('\n=== Testing Invalid Requests ===');
  let passed = 0;
  let failed = 0;

  for (const test of invalidRequests) {
    try {
      await axios.post(
        `${BASE_URL}/api/public/imagery-requests`,
        test.data
      );
      console.error(`✗ ${test.name}: Should have been rejected`);
      failed++;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✓ ${test.name}: Correctly rejected`);
        passed++;
      } else {
        console.error(`✗ ${test.name}: Unexpected error`);
        console.error('Error:', error.message);
        failed++;
      }
    }
  }

  console.log(`\nInvalid request tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

async function testAreaCalculation() {
  console.log('\n=== Testing Area Calculation ===');
  
  // Test with a request that has no area provided
  const requestWithoutArea = {
    ...validRequest,
    aoi_area_km2: undefined
  };
  delete requestWithoutArea.aoi_area_km2;

  try {
    const response = await axios.post(
      `${BASE_URL}/api/public/imagery-requests`,
      requestWithoutArea
    );
    console.log('✓ Area calculated automatically');
    console.log('Calculated area:', response.data.request.aoi_area_km2, 'km²');
    return true;
  } catch (error) {
    console.error('✗ Area calculation failed');
    if (error.response) {
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

async function runTests() {
  console.log('Starting Imagery Request API Tests...');
  console.log('API URL:', BASE_URL);

  const results = {
    validRequest: await testValidRequest(),
    invalidRequests: await testInvalidRequests(),
    areaCalculation: await testAreaCalculation()
  };

  console.log('\n=== Test Summary ===');
  console.log('Valid Request:', results.validRequest ? '✓ PASS' : '✗ FAIL');
  console.log('Invalid Requests:', results.invalidRequests ? '✓ PASS' : '✗ FAIL');
  console.log('Area Calculation:', results.areaCalculation ? '✓ PASS' : '✗ FAIL');

  const allPassed = Object.values(results).every(r => r === true);
  console.log('\nOverall:', allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED');

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
