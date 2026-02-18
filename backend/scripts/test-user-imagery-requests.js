const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Test credentials - you'll need to use actual user credentials
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123'
};

let authToken = null;
let testRequestId = null;

async function login() {
  console.log('\n=== Testing User Login ===');
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    authToken = response.data.token;
    console.log('✓ Login successful');
    console.log('User:', response.data.user.email);
    return true;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function createTestRequest() {
  console.log('\n=== Creating Test Imagery Request ===');
  try {
    const response = await axios.post(
      `${API_URL}/api/public/imagery-requests`,
      {
        full_name: 'Test User',
        email: TEST_USER.email,
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
        additional_requirements: 'Test request for user imagery requests API'
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    testRequestId = response.data.request_id;
    console.log('✓ Test request created');
    console.log('Request ID:', testRequestId);
    return true;
  } catch (error) {
    console.error('✗ Failed to create test request:', error.response?.data || error.message);
    return false;
  }
}

async function testGetUserRequests() {
  console.log('\n=== Testing GET /api/user/imagery-requests ===');
  try {
    const response = await axios.get(`${API_URL}/api/user/imagery-requests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✓ Successfully fetched user requests');
    console.log('Total requests:', response.data.pagination.total);
    console.log('Requests on page:', response.data.requests.length);
    console.log('Pagination:', response.data.pagination);
    
    if (response.data.requests.length > 0) {
      console.log('\nFirst request:');
      console.log('- ID:', response.data.requests[0]._id);
      console.log('- Status:', response.data.requests[0].status);
      console.log('- AOI Area:', response.data.requests[0].aoi_area_km2, 'km²');
      console.log('- Created:', response.data.requests[0].created_at);
    }
    
    return true;
  } catch (error) {
    console.error('✗ Failed to fetch user requests:', error.response?.data || error.message);
    return false;
  }
}

async function testGetUserRequestsWithPagination() {
  console.log('\n=== Testing GET /api/user/imagery-requests with pagination ===');
  try {
    const response = await axios.get(`${API_URL}/api/user/imagery-requests?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✓ Successfully fetched user requests with pagination');
    console.log('Page:', response.data.pagination.page);
    console.log('Limit:', response.data.pagination.limit);
    console.log('Total pages:', response.data.pagination.totalPages);
    
    return true;
  } catch (error) {
    console.error('✗ Failed to fetch user requests with pagination:', error.response?.data || error.message);
    return false;
  }
}

async function testGetUserRequestsWithStatusFilter() {
  console.log('\n=== Testing GET /api/user/imagery-requests with status filter ===');
  try {
    const response = await axios.get(`${API_URL}/api/user/imagery-requests?status=pending`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✓ Successfully fetched pending requests');
    console.log('Pending requests:', response.data.requests.length);
    
    // Verify all returned requests have pending status
    const allPending = response.data.requests.every(req => req.status === 'pending');
    if (allPending) {
      console.log('✓ All returned requests have pending status');
    } else {
      console.log('✗ Some requests do not have pending status');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Failed to fetch pending requests:', error.response?.data || error.message);
    return false;
  }
}

async function testGetSingleRequest() {
  console.log('\n=== Testing GET /api/user/imagery-requests/:id ===');
  
  if (!testRequestId) {
    console.log('⚠ No test request ID available, skipping test');
    return true;
  }
  
  try {
    const response = await axios.get(`${API_URL}/api/user/imagery-requests/${testRequestId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✓ Successfully fetched single request');
    console.log('Request ID:', response.data.request._id);
    console.log('Status:', response.data.request.status);
    console.log('Full Name:', response.data.request.full_name);
    console.log('Email:', response.data.request.email);
    console.log('AOI Type:', response.data.request.aoi_type);
    console.log('AOI Area:', response.data.request.aoi_area_km2, 'km²');
    console.log('Urgency:', response.data.request.urgency);
    
    // Verify admin fields are not exposed
    if (response.data.request.admin_notes !== undefined || response.data.request.reviewed_by !== undefined) {
      console.log('✗ Admin fields are exposed (should be hidden)');
      return false;
    } else {
      console.log('✓ Admin fields are properly hidden');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Failed to fetch single request:', error.response?.data || error.message);
    return false;
  }
}

async function testGetNonExistentRequest() {
  console.log('\n=== Testing GET /api/user/imagery-requests/:id with non-existent ID ===');
  try {
    await axios.get(`${API_URL}/api/user/imagery-requests/507f1f77bcf86cd799439011`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✗ Should have returned 404 for non-existent request');
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✓ Correctly returned 404 for non-existent request');
      return true;
    }
    console.error('✗ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function testGetRequestWithInvalidId() {
  console.log('\n=== Testing GET /api/user/imagery-requests/:id with invalid ID ===');
  try {
    await axios.get(`${API_URL}/api/user/imagery-requests/invalid-id`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✗ Should have returned 400 for invalid ID');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✓ Correctly returned 400 for invalid ID');
      return true;
    }
    console.error('✗ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n=== Testing unauthorized access ===');
  try {
    await axios.get(`${API_URL}/api/user/imagery-requests`);
    
    console.log('✗ Should have returned 401 for unauthorized access');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✓ Correctly returned 401 for unauthorized access');
      return true;
    }
    console.error('✗ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('===========================================');
  console.log('User Imagery Requests API Test Suite');
  console.log('===========================================');
  console.log('API URL:', API_URL);
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test unauthorized access first
  if (await testUnauthorizedAccess()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Login
  if (!await login()) {
    console.log('\n❌ Cannot proceed without authentication');
    process.exit(1);
  }
  
  // Create test request
  await createTestRequest();
  
  // Run tests
  const tests = [
    testGetUserRequests,
    testGetUserRequestsWithPagination,
    testGetUserRequestsWithStatusFilter,
    testGetSingleRequest,
    testGetNonExistentRequest,
    testGetRequestWithInvalidId
  ];
  
  for (const test of tests) {
    if (await test()) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // Summary
  console.log('\n===========================================');
  console.log('Test Summary');
  console.log('===========================================');
  console.log('Passed:', results.passed);
  console.log('Failed:', results.failed);
  console.log('Total:', results.passed + results.failed);
  
  if (results.failed === 0) {
    console.log('\n✓ All tests passed!');
  } else {
    console.log('\n✗ Some tests failed');
    process.exit(1);
  }
}

runTests();
