const http = require('http');
require('dotenv').config();

const API_HOST = 'localhost';
const API_PORT = process.env.PORT || 5000;

let authToken = null;

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
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
            headers: res.headers,
            data: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testHealthCheck() {
  console.log('\n=== Testing Health Check ===');
  try {
    const response = await makeRequest('GET', '/api/health');
    if (response.status === 200) {
      console.log('✓ Server is running');
      console.log('  Response:', response.data);
      return true;
    } else {
      console.log('✗ Unexpected status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('✗ Server not reachable:', error.message);
    return false;
  }
}

async function login() {
  console.log('\n=== Testing Login ===');
  try {
    const response = await makeRequest('POST', '/api/auth/signin', {
      email: 'admin@earthintelligence.com',
      password: 'Admin@123456'
    });
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✓ Login successful');
      console.log('  User:', response.data.user.email);
      console.log('  Token:', authToken.substring(0, 20) + '...');
      return true;
    } else {
      console.log('✗ Login failed');
      console.log('  Status:', response.status);
      console.log('  Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('✗ Login error:', error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n=== Testing Unauthorized Access ===');
  try {
    const response = await makeRequest('GET', '/api/user/imagery-requests');
    
    if (response.status === 401) {
      console.log('✓ Correctly returned 401 for unauthorized access');
      return true;
    } else {
      console.log('✗ Expected 401, got:', response.status);
      return false;
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
}

async function createTestRequest() {
  console.log('\n=== Creating Test Request ===');
  try {
    const response = await makeRequest(
      'POST',
      '/api/public/imagery-requests',
      {
        full_name: 'Test User',
        email: 'admin@earthintelligence.com',
        company: 'Test Company',
        phone: '+1234567890',
        aoi_type: 'polygon',
        aoi_coordinates: {
          type: 'Polygon',
          coordinates: [[
            [74.0, 31.0],
            [74.5, 31.0],
            [74.5, 31.5],
            [74.0, 31.5],
            [74.0, 31.0]
          ]]
        },
        aoi_area_km2: 3000,
        aoi_center: {
          lat: 31.25,
          lng: 74.25
        },
        date_range: {
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        },
        filters: {
          resolution_category: ['vhr', 'high'],
          max_cloud_coverage: 20,
          providers: ['Maxar'],
          image_types: ['optical']
        },
        urgency: 'standard',
        additional_requirements: 'Test request'
      },
      {
        'Authorization': `Bearer ${authToken}`
      }
    );
    
    if (response.status === 201) {
      console.log('✓ Test request created');
      console.log('  Request ID:', response.data.request_id);
      return response.data.request_id;
    } else {
      console.log('⚠ Could not create test request (status:', response.status + ')');
      return null;
    }
  } catch (error) {
    console.error('⚠ Error creating test request:', error.message);
    return null;
  }
}

async function testGetUserRequests() {
  console.log('\n=== Testing GET /api/user/imagery-requests ===');
  try {
    const response = await makeRequest(
      'GET',
      '/api/user/imagery-requests',
      null,
      {
        'Authorization': `Bearer ${authToken}`
      }
    );
    
    if (response.status === 200) {
      console.log('✓ Successfully fetched user requests');
      console.log('  Total requests:', response.data.pagination.total);
      console.log('  Requests on page:', response.data.requests.length);
      console.log('  Current page:', response.data.pagination.page);
      console.log('  Total pages:', response.data.pagination.totalPages);
      
      if (response.data.requests.length > 0) {
        const firstRequest = response.data.requests[0];
        console.log('\n  First request:');
        console.log('    ID:', firstRequest._id);
        console.log('    Status:', firstRequest.status);
        console.log('    AOI Area:', firstRequest.aoi_area_km2, 'km²');
        
        // Check admin fields are hidden
        if (firstRequest.admin_notes !== undefined || firstRequest.reviewed_by !== undefined) {
          console.log('  ✗ WARNING: Admin fields are exposed!');
          return { success: false, requestId: firstRequest._id };
        } else {
          console.log('  ✓ Admin fields properly hidden');
        }
        
        return { success: true, requestId: firstRequest._id };
      }
      
      return { success: true, requestId: null };
    } else {
      console.log('✗ Failed with status:', response.status);
      console.log('  Response:', response.data);
      return { success: false, requestId: null };
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    return { success: false, requestId: null };
  }
}

async function testGetSingleRequest(requestId) {
  console.log('\n=== Testing GET /api/user/imagery-requests/:id ===');
  
  if (!requestId) {
    console.log('⚠ No request ID available, skipping test');
    return true;
  }
  
  try {
    const response = await makeRequest(
      'GET',
      `/api/user/imagery-requests/${requestId}`,
      null,
      {
        'Authorization': `Bearer ${authToken}`
      }
    );
    
    if (response.status === 200) {
      console.log('✓ Successfully fetched single request');
      console.log('  Request ID:', response.data.request._id);
      console.log('  Status:', response.data.request.status);
      console.log('  Full Name:', response.data.request.full_name);
      console.log('  AOI Type:', response.data.request.aoi_type);
      console.log('  AOI Area:', response.data.request.aoi_area_km2, 'km²');
      
      // Check admin fields are hidden
      if (response.data.request.admin_notes !== undefined || response.data.request.reviewed_by !== undefined) {
        console.log('  ✗ WARNING: Admin fields are exposed!');
        return false;
      } else {
        console.log('  ✓ Admin fields properly hidden');
      }
      
      return true;
    } else {
      console.log('✗ Failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
}

async function testPagination() {
  console.log('\n=== Testing Pagination ===');
  try {
    const response = await makeRequest(
      'GET',
      '/api/user/imagery-requests?page=1&limit=5',
      null,
      {
        'Authorization': `Bearer ${authToken}`
      }
    );
    
    if (response.status === 200) {
      console.log('✓ Pagination works');
      console.log('  Page:', response.data.pagination.page);
      console.log('  Limit:', response.data.pagination.limit);
      console.log('  Total:', response.data.pagination.total);
      return true;
    } else {
      console.log('✗ Failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
}

async function testStatusFilter() {
  console.log('\n=== Testing Status Filter ===');
  try {
    const response = await makeRequest(
      'GET',
      '/api/user/imagery-requests?status=pending',
      null,
      {
        'Authorization': `Bearer ${authToken}`
      }
    );
    
    if (response.status === 200) {
      console.log('✓ Status filter works');
      console.log('  Pending requests:', response.data.requests.length);
      
      const allPending = response.data.requests.every(req => req.status === 'pending');
      if (allPending || response.data.requests.length === 0) {
        console.log('  ✓ All returned requests have pending status');
        return true;
      } else {
        console.log('  ✗ Some requests do not have pending status');
        return false;
      }
    } else {
      console.log('✗ Failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
}

async function testInvalidRequestId() {
  console.log('\n=== Testing Invalid Request ID ===');
  try {
    const response = await makeRequest(
      'GET',
      '/api/user/imagery-requests/invalid-id',
      null,
      {
        'Authorization': `Bearer ${authToken}`
      }
    );
    
    if (response.status === 400) {
      console.log('✓ Correctly returned 400 for invalid ID');
      return true;
    } else {
      console.log('✗ Expected 400, got:', response.status);
      return false;
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('===========================================');
  console.log('User Imagery Requests API Test');
  console.log('===========================================');
  console.log('API:', `http://${API_HOST}:${API_PORT}`);
  
  let passed = 0;
  let failed = 0;
  
  // Check server health
  if (!await testHealthCheck()) {
    console.log('\n❌ Server is not running. Please start the server first.');
    process.exit(1);
  }
  
  // Test unauthorized access
  if (await testUnauthorizedAccess()) {
    passed++;
  } else {
    failed++;
  }
  
  // Login
  if (!await login()) {
    console.log('\n❌ Cannot proceed without authentication');
    process.exit(1);
  }
  
  // Create test request
  const newRequestId = await createTestRequest();
  
  // Test get user requests
  const getUserResult = await testGetUserRequests();
  if (getUserResult.success) {
    passed++;
  } else {
    failed++;
  }
  
  // Test get single request
  const requestIdToTest = newRequestId || getUserResult.requestId;
  if (await testGetSingleRequest(requestIdToTest)) {
    passed++;
  } else {
    failed++;
  }
  
  // Test pagination
  if (await testPagination()) {
    passed++;
  } else {
    failed++;
  }
  
  // Test status filter
  if (await testStatusFilter()) {
    passed++;
  } else {
    failed++;
  }
  
  // Test invalid request ID
  if (await testInvalidRequestId()) {
    passed++;
  } else {
    failed++;
  }
  
  // Summary
  console.log('\n===========================================');
  console.log('Test Summary');
  console.log('===========================================');
  console.log('✓ Passed:', passed);
  console.log('✗ Failed:', failed);
  console.log('Total:', passed + failed);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('\n❌ Test suite error:', error);
  process.exit(1);
});
