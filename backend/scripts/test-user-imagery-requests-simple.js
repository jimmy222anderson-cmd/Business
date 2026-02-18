const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Use admin credentials for testing (they can also be regular users)
const TEST_USER = {
  email: 'admin@earthintelligence.com',
  password: 'Admin@123456'
};

let authToken = null;
let userId = null;

async function login() {
  console.log('\n=== Step 1: Login ===');
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    authToken = response.data.token;
    userId = response.data.user.id;
    console.log('✓ Login successful');
    console.log('  User:', response.data.user.email);
    console.log('  User ID:', userId);
    return true;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function createTestRequest() {
  console.log('\n=== Step 2: Create Test Request (as authenticated user) ===');
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
        additional_requirements: 'Test request for user API'
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log('✓ Test request created');
    console.log('  Request ID:', response.data.request_id);
    return response.data.request_id;
  } catch (error) {
    console.error('✗ Failed to create test request:', error.response?.data || error.message);
    return null;
  }
}

async function testGetUserRequests() {
  console.log('\n=== Step 3: GET /api/user/imagery-requests ===');
  try {
    const response = await axios.get(`${API_URL}/api/user/imagery-requests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✓ Successfully fetched user requests');
    console.log('  Total requests:', response.data.pagination.total);
    console.log('  Requests on page:', response.data.requests.length);
    console.log('  Current page:', response.data.pagination.page);
    console.log('  Total pages:', response.data.pagination.totalPages);
    
    if (response.data.requests.length > 0) {
      const firstRequest = response.data.requests[0];
      console.log('\n  First request details:');
      console.log('    ID:', firstRequest._id);
      console.log('    Status:', firstRequest.status);
      console.log('    AOI Area:', firstRequest.aoi_area_km2, 'km²');
      console.log('    Created:', new Date(firstRequest.created_at).toLocaleString());
      
      // Check that admin fields are not exposed
      if (firstRequest.admin_notes !== undefined || firstRequest.reviewed_by !== undefined) {
        console.log('  ✗ WARNING: Admin fields are exposed!');
        return { success: false, requestId: firstRequest._id };
      } else {
        console.log('  ✓ Admin fields properly hidden');
      }
      
      return { success: true, requestId: firstRequest._id };
    }
    
    return { success: true, requestId: null };
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
    return { success: false, requestId: null };
  }
}

async function testGetSingleRequest(requestId) {
  console.log('\n=== Step 4: GET /api/user/imagery-requests/:id ===');
  
  if (!requestId) {
    console.log('⚠ No request ID available, skipping test');
    return true;
  }
  
  try {
    const response = await axios.get(`${API_URL}/api/user/imagery-requests/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✓ Successfully fetched single request');
    console.log('  Request ID:', response.data.request._id);
    console.log('  Status:', response.data.request.status);
    console.log('  Full Name:', response.data.request.full_name);
    console.log('  Email:', response.data.request.email);
    console.log('  AOI Type:', response.data.request.aoi_type);
    console.log('  AOI Area:', response.data.request.aoi_area_km2, 'km²');
    console.log('  Urgency:', response.data.request.urgency);
    
    // Verify admin fields are not exposed
    if (response.data.request.admin_notes !== undefined || response.data.request.reviewed_by !== undefined) {
      console.log('  ✗ WARNING: Admin fields are exposed!');
      return false;
    } else {
      console.log('  ✓ Admin fields properly hidden');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testPagination() {
  console.log('\n=== Step 5: Test Pagination ===');
  try {
    const response = await axios.get(`${API_URL}/api/user/imagery-requests?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✓ Pagination works');
    console.log('  Page:', response.data.pagination.page);
    console.log('  Limit:', response.data.pagination.limit);
    console.log('  Total:', response.data.pagination.total);
    console.log('  Total Pages:', response.data.pagination.totalPages);
    
    return true;
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testStatusFilter() {
  console.log('\n=== Step 6: Test Status Filter ===');
  try {
    const response = await axios.get(`${API_URL}/api/user/imagery-requests?status=pending`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✓ Status filter works');
    console.log('  Pending requests:', response.data.requests.length);
    
    // Verify all returned requests have pending status
    const allPending = response.data.requests.every(req => req.status === 'pending');
    if (allPending || response.data.requests.length === 0) {
      console.log('  ✓ All returned requests have pending status');
      return true;
    } else {
      console.log('  ✗ Some requests do not have pending status');
      return false;
    }
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n=== Step 7: Test Unauthorized Access ===');
  try {
    await axios.get(`${API_URL}/api/user/imagery-requests`);
    console.log('✗ Should have returned 401');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✓ Correctly returned 401 for unauthorized access');
      return true;
    }
    console.error('✗ Unexpected error:', error.response?.status);
    return false;
  }
}

async function testInvalidRequestId() {
  console.log('\n=== Step 8: Test Invalid Request ID ===');
  try {
    await axios.get(`${API_URL}/api/user/imagery-requests/invalid-id`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✗ Should have returned 400');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✓ Correctly returned 400 for invalid ID');
      return true;
    }
    console.error('✗ Unexpected error:', error.response?.status);
    return false;
  }
}

async function runTests() {
  console.log('===========================================');
  console.log('User Imagery Requests API Test');
  console.log('===========================================');
  console.log('API URL:', API_URL);
  
  let passed = 0;
  let failed = 0;
  
  // Test unauthorized access first
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

runTests();
