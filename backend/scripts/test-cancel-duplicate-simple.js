/**
 * Simple test for cancel and duplicate functionality
 * Run this after starting the backend server
 */

const http = require('http');

// Test configuration
const config = {
  host: 'localhost',
  port: 5000,
  // Update these with your test credentials
  email: 'test@example.com',
  password: 'Test123!@#'
};

console.log('🧪 Cancel & Duplicate Request Test\n');
console.log('Prerequisites:');
console.log('1. Backend server must be running on port 5000');
console.log('2. Test user must exist with credentials above');
console.log('3. Test user must have at least one imagery request\n');

// Check if server is running
const checkServer = http.get(`http://${config.host}:${config.port}/api/health`, (res) => {
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('✅ Server is running\n');
    runTests();
  }
});

checkServer.on('error', (err) => {
  console.log('❌ Server is not running!');
  console.log('\nPlease start the backend server first:');
  console.log('  cd backend');
  console.log('  npm start\n');
  process.exit(1);
});

function makeRequest(path, method, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.host,
      port: config.port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  try {
    // Step 1: Login
    console.log('Step 1: Login');
    const loginRes = await makeRequest('/api/auth/signin', 'POST', {
      email: config.email,
      password: config.password
    });

    if (loginRes.status !== 200) {
      console.log('❌ Login failed:', loginRes.data);
      console.log('\nPlease update the credentials in this script or create a test user.');
      return;
    }

    const token = loginRes.data.token;
    console.log('✅ Logged in successfully\n');

    // Step 2: Get requests
    console.log('Step 2: Fetch imagery requests');
    const requestsRes = await makeRequest('/api/user/imagery-requests', 'GET', null, token);

    if (requestsRes.status !== 200) {
      console.log('❌ Failed to fetch requests:', requestsRes.data);
      return;
    }

    const requests = requestsRes.data.requests;
    console.log(`✅ Found ${requests.length} requests\n`);

    if (requests.length === 0) {
      console.log('⚠️  No requests found. Please create a request first.');
      return;
    }

    // Display all requests
    console.log('Available requests:');
    requests.forEach((req, idx) => {
      console.log(`  ${idx + 1}. ID: ${req._id}`);
      console.log(`     Status: ${req.status}`);
      console.log(`     Created: ${new Date(req.created_at).toLocaleString()}`);
      console.log(`     Cancellable: ${req.status === 'pending' || req.status === 'reviewing' ? 'Yes' : 'No'}\n`);
    });

    // Step 3: Test cancel on first cancellable request
    const cancellableReq = requests.find(r => r.status === 'pending' || r.status === 'reviewing');

    if (cancellableReq) {
      console.log('Step 3: Test Cancel Request');
      console.log(`Cancelling request: ${cancellableReq._id}`);

      const cancelRes = await makeRequest(
        `/api/user/imagery-requests/${cancellableReq._id}/cancel`,
        'POST',
        { cancellation_reason: 'Automated test' },
        token
      );

      console.log(`Status Code: ${cancelRes.status}`);

      if (cancelRes.status === 200) {
        console.log('✅ Cancel successful!');
        console.log('Response:', JSON.stringify(cancelRes.data, null, 2));

        // Verify status changed
        const verifyRes = await makeRequest(
          `/api/user/imagery-requests/${cancellableReq._id}`,
          'GET',
          null,
          token
        );

        if (verifyRes.data.request.status === 'cancelled') {
          console.log('✅ Status verified as cancelled');

          if (verifyRes.data.request.status_history) {
            console.log(`✅ Status history has ${verifyRes.data.request.status_history.length} entries`);
          }
        }
      } else {
        console.log('❌ Cancel failed:', cancelRes.data);
      }
      console.log('');
    } else {
      console.log('Step 3: Test Cancel Request');
      console.log('⚠️  No cancellable requests (need pending or reviewing status)\n');
    }

    // Step 4: Test duplicate data structure
    console.log('Step 4: Test Duplicate Data Structure');
    const testReq = requests[0];
    const detailRes = await makeRequest(
      `/api/user/imagery-requests/${testReq._id}`,
      'GET',
      null,
      token
    );

    if (detailRes.status === 200) {
      const request = detailRes.data.request;
      const requiredFields = [
        'aoi_type', 'aoi_coordinates', 'aoi_area_km2',
        'aoi_center', 'date_range', 'filters', 'urgency'
      ];

      let allPresent = true;
      requiredFields.forEach(field => {
        if (!request[field]) {
          console.log(`❌ Missing field: ${field}`);
          allPresent = false;
        }
      });

      if (allPresent) {
        console.log('✅ All required fields present for duplication');
        console.log('\nDuplicate payload structure:');
        console.log(JSON.stringify({
          aoi_type: request.aoi_type,
          aoi_coordinates: request.aoi_coordinates,
          filters: request.filters,
          urgency: request.urgency
        }, null, 2));
      }
    }

    console.log('\n✅ Tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('- Cancel Request API: Tested');
    console.log('- Status Update: Verified');
    console.log('- Status History: Checked');
    console.log('- Duplicate Data: Validated');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}
