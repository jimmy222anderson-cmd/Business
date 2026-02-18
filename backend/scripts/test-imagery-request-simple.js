/**
 * Simple test script for imagery request API endpoint
 * Uses built-in http module
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

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

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/public/imagery-requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            data: JSON.parse(body)
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testValidRequest() {
  console.log('\n=== Testing Valid Request ===');
  try {
    const response = await makeRequest(validRequest);
    if (response.status === 201) {
      console.log('✓ Valid request accepted');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.error('✗ Unexpected status:', response.status);
      console.error('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('✗ Request failed:', error.message);
    return false;
  }
}

async function testMissingFields() {
  console.log('\n=== Testing Missing Required Fields ===');
  try {
    const response = await makeRequest({ email: 'test@example.com' });
    if (response.status === 400) {
      console.log('✓ Missing fields correctly rejected');
      return true;
    } else {
      console.error('✗ Should have been rejected with 400');
      return false;
    }
  } catch (error) {
    console.error('✗ Request failed:', error.message);
    return false;
  }
}

async function testInvalidEmail() {
  console.log('\n=== Testing Invalid Email ===');
  try {
    const invalidData = { ...validRequest, email: 'invalid-email' };
    const response = await makeRequest(invalidData);
    if (response.status === 400) {
      console.log('✓ Invalid email correctly rejected');
      return true;
    } else {
      console.error('✗ Should have been rejected with 400');
      return false;
    }
  } catch (error) {
    console.error('✗ Request failed:', error.message);
    return false;
  }
}

async function testInvalidDateRange() {
  console.log('\n=== Testing Invalid Date Range ===');
  try {
    const invalidData = {
      ...validRequest,
      date_range: {
        start_date: '2024-12-31',
        end_date: '2024-01-01'
      }
    };
    const response = await makeRequest(invalidData);
    if (response.status === 400) {
      console.log('✓ Invalid date range correctly rejected');
      return true;
    } else {
      console.error('✗ Should have been rejected with 400');
      return false;
    }
  } catch (error) {
    console.error('✗ Request failed:', error.message);
    return false;
  }
}

async function testAreaCalculation() {
  console.log('\n=== Testing Area Calculation ===');
  try {
    const requestWithoutArea = { ...validRequest };
    delete requestWithoutArea.aoi_area_km2;
    
    const response = await makeRequest(requestWithoutArea);
    if (response.status === 201 && response.data.request.aoi_area_km2) {
      console.log('✓ Area calculated automatically');
      console.log('Calculated area:', response.data.request.aoi_area_km2, 'km²');
      return true;
    } else {
      console.error('✗ Area calculation failed');
      console.error('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('✗ Request failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting Imagery Request API Tests...');
  console.log(`API URL: http://${HOST}:${PORT}`);

  const results = {
    validRequest: await testValidRequest(),
    missingFields: await testMissingFields(),
    invalidEmail: await testInvalidEmail(),
    invalidDateRange: await testInvalidDateRange(),
    areaCalculation: await testAreaCalculation()
  };

  console.log('\n=== Test Summary ===');
  console.log('Valid Request:', results.validRequest ? '✓ PASS' : '✗ FAIL');
  console.log('Missing Fields:', results.missingFields ? '✓ PASS' : '✗ FAIL');
  console.log('Invalid Email:', results.invalidEmail ? '✓ PASS' : '✗ FAIL');
  console.log('Invalid Date Range:', results.invalidDateRange ? '✓ PASS' : '✗ FAIL');
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
