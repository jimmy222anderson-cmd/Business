/**
 * Automated test script for cancel and duplicate request features
 */

const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function loginUser() {
  console.log('\n📝 Logging in as test user...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const response = await makeRequest(options, TEST_USER);
  
  if (response.statusCode === 200 && response.body.token) {
    console.log('✅ Login successful');
    return response.body.token;
  } else {
    console.log('❌ Login failed:', response.body);
    throw new Error('Login failed');
  }
}

async function getUserRequests(token) {
  console.log('\n📋 Fetching user imagery requests...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/user/imagery-requests',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const response = await makeRequest(options);
  
  if (response.statusCode === 200) {
    console.log(`✅ Found ${response.body.requests.length} requests`);
    return response.body.requests;
  } else {
    console.log('❌ Failed to fetch requests:', response.body);
    throw new Error('Failed to fetch requests');
  }
}

async function testCancelRequest(token, requestId) {
  console.log('\n🚫 Testing cancel request...');
  console.log(`Request ID: ${requestId}`);
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/user/imagery-requests/${requestId}/cancel`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const response = await makeRequest(options, {
    cancellation_reason: 'Testing cancel functionality'
  });
  
  console.log(`Status Code: ${response.statusCode}`);
  
  if (response.statusCode === 200) {
    console.log('✅ Cancel request successful');
    console.log('Response:', JSON.stringify(response.body, null, 2));
    return true;
  } else {
    console.log('❌ Cancel request failed');
    console.log('Error:', JSON.stringify(response.body, null, 2));
    return false;
  }
}

async function getRequestDetails(token, requestId) {
  console.log('\n🔍 Fetching request details...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/user/imagery-requests/${requestId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const response = await makeRequest(options);
  
  if (response.statusCode === 200) {
    console.log('✅ Request details fetched');
    return response.body.request;
  } else {
    console.log('❌ Failed to fetch request details:', response.body);
    return null;
  }
}

async function testDuplicateRequest(token, originalRequest) {
  console.log('\n📋 Testing duplicate request data structure...');
  
  // Verify the original request has all necessary data for duplication
  const requiredFields = [
    'aoi_type',
    'aoi_coordinates',
    'aoi_area_km2',
    'aoi_center',
    'date_range',
    'filters',
    'urgency',
    'additional_requirements'
  ];
  
  let allFieldsPresent = true;
  for (const field of requiredFields) {
    if (!originalRequest[field]) {
      console.log(`❌ Missing field: ${field}`);
      allFieldsPresent = false;
    }
  }
  
  if (allFieldsPresent) {
    console.log('✅ All required fields present for duplication');
    console.log('\nDuplicate data structure:');
    console.log(JSON.stringify({
      aoi_type: originalRequest.aoi_type,
      aoi_coordinates: originalRequest.aoi_coordinates,
      aoi_area_km2: originalRequest.aoi_area_km2,
      aoi_center: originalRequest.aoi_center,
      date_range: originalRequest.date_range,
      filters: originalRequest.filters,
      urgency: originalRequest.urgency,
      additional_requirements: originalRequest.additional_requirements
    }, null, 2));
    return true;
  } else {
    console.log('❌ Some required fields missing');
    return false;
  }
}

// Main test execution
async function runTests() {
  console.log('🧪 Starting Cancel and Duplicate Request Tests');
  console.log('==============================================');
  
  try {
    // Step 1: Login
    const token = await loginUser();
    
    // Step 2: Get user requests
    const requests = await getUserRequests(token);
    
    if (requests.length === 0) {
      console.log('\n⚠️  No requests found. Please create a request first.');
      return;
    }
    
    // Find a cancellable request (pending or reviewing)
    const cancellableRequest = requests.find(r => 
      r.status === 'pending' || r.status === 'reviewing'
    );
    
    if (!cancellableRequest) {
      console.log('\n⚠️  No cancellable requests found (need pending or reviewing status)');
      console.log('Available requests:');
      requests.forEach(r => {
        console.log(`  - ID: ${r._id}, Status: ${r.status}`);
      });
    } else {
      // Step 3: Test cancel request
      const cancelSuccess = await testCancelRequest(token, cancellableRequest._id);
      
      if (cancelSuccess) {
        // Verify the status changed
        const updatedRequest = await getRequestDetails(token, cancellableRequest._id);
        if (updatedRequest && updatedRequest.status === 'cancelled') {
          console.log('✅ Status verified as cancelled');
          
          // Check status history
          if (updatedRequest.status_history && updatedRequest.status_history.length > 0) {
            console.log('✅ Status history tracked');
            console.log(`   History entries: ${updatedRequest.status_history.length}`);
          } else {
            console.log('⚠️  Status history not found');
          }
        } else {
          console.log('⚠️  Status not updated to cancelled');
        }
      }
    }
    
    // Step 4: Test duplicate data structure
    const anyRequest = requests[0];
    const detailedRequest = await getRequestDetails(token, anyRequest._id);
    
    if (detailedRequest) {
      await testDuplicateRequest(token, detailedRequest);
    }
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('- Cancel Request: Tests the POST /api/user/imagery-requests/:id/cancel endpoint');
    console.log('- Duplicate Request: Verifies data structure for frontend duplication');
    console.log('- Status History: Confirms status changes are tracked');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the tests
runTests();
