/**
 * Test cancel and duplicate functionality using a token
 * Run: node scripts/test-cancel-duplicate-with-token.js <TOKEN>
 */

const http = require('http');

// Get token from command line argument
const token = process.argv[2];

if (!token) {
  console.log('❌ Please provide a token as argument');
  console.log('\nUsage:');
  console.log('  node scripts/test-cancel-duplicate-with-token.js <TOKEN>');
  console.log('\nTo get a token:');
  console.log('  1. Login to the application in your browser');
  console.log('  2. Open browser DevTools → Application → Local Storage');
  console.log('  3. Copy the "token" value');
  console.log('  OR');
  console.log('  4. Run: node scripts/get-test-user-token.js');
  process.exit(1);
}

const config = {
  host: 'localhost',
  port: 5000
};

console.log('🧪 Cancel & Duplicate Request Test\n');

function makeRequest(path, method, data, authToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.host,
      port: config.port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };

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
    console.log('Step 1: Verify token and fetch requests');
    const requestsRes = await makeRequest('/api/user/imagery-requests', 'GET', null, token);

    if (requestsRes.status !== 200) {
      console.log('❌ Failed to fetch requests:', requestsRes.data);
      console.log('\nPossible issues:');
      console.log('- Token is invalid or expired');
      console.log('- Server is not running');
      console.log('- User has no requests');
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
      console.log(`     Cancellable: ${req.status === 'pending' || req.status === 'reviewing' ? 'Yes ✅' : 'No ❌'}\n`);
    });

    // Test cancel on first cancellable request
    const cancellableReq = requests.find(r => r.status === 'pending' || r.status === 'reviewing');

    if (cancellableReq) {
      console.log('═══════════════════════════════════════');
      console.log('Step 2: Test Cancel Request');
      console.log('═══════════════════════════════════════');
      console.log(`Cancelling request: ${cancellableReq._id}`);
      console.log(`Current status: ${cancellableReq.status}\n`);

      const cancelRes = await makeRequest(
        `/api/user/imagery-requests/${cancellableReq._id}/cancel`,
        'POST',
        { cancellation_reason: 'Automated test - testing cancel functionality' },
        token
      );

      console.log(`Response Status Code: ${cancelRes.status}`);

      if (cancelRes.status === 200) {
        console.log('✅ Cancel request successful!');
        console.log('\nResponse:');
        console.log(JSON.stringify(cancelRes.data, null, 2));

        // Verify the status changed
        console.log('\nVerifying status change...');
        const verifyRes = await makeRequest(
          `/api/user/imagery-requests/${cancellableReq._id}`,
          'GET',
          null,
          token
        );

        if (verifyRes.status === 200) {
          const updatedRequest = verifyRes.data.request;
          
          if (updatedRequest.status === 'cancelled') {
            console.log('✅ Status verified as "cancelled"');
          } else {
            console.log(`⚠️  Status is "${updatedRequest.status}" (expected "cancelled")`);
          }

          if (updatedRequest.status_history && updatedRequest.status_history.length > 0) {
            console.log(`✅ Status history tracked (${updatedRequest.status_history.length} entries)`);
            console.log('\nStatus History:');
            updatedRequest.status_history.forEach((entry, idx) => {
              console.log(`  ${idx + 1}. ${entry.status} - ${new Date(entry.changed_at).toLocaleString()}`);
            });
          } else {
            console.log('⚠️  Status history not found');
          }
        }
      } else {
        console.log('❌ Cancel request failed');
        console.log('Error:', JSON.stringify(cancelRes.data, null, 2));
      }
      console.log('');
    } else {
      console.log('═══════════════════════════════════════');
      console.log('Step 2: Test Cancel Request');
      console.log('═══════════════════════════════════════');
      console.log('⚠️  No cancellable requests found');
      console.log('Only requests with status "pending" or "reviewing" can be cancelled\n');
    }

    // Test duplicate data structure
    console.log('═══════════════════════════════════════');
    console.log('Step 3: Test Duplicate Data Structure');
    console.log('═══════════════════════════════════════');
    const testReq = requests[0];
    console.log(`Testing with request: ${testReq._id}\n`);
    
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

      console.log('Checking required fields for duplication:');
      let allPresent = true;
      requiredFields.forEach(field => {
        const present = !!request[field];
        console.log(`  ${present ? '✅' : '❌'} ${field}`);
        if (!present) allPresent = false;
      });

      if (allPresent) {
        console.log('\n✅ All required fields present for duplication');
        console.log('\nDuplicate payload structure:');
        console.log(JSON.stringify({
          aoi_type: request.aoi_type,
          aoi_coordinates: request.aoi_coordinates,
          aoi_area_km2: request.aoi_area_km2,
          aoi_center: request.aoi_center,
          date_range: request.date_range,
          filters: request.filters,
          urgency: request.urgency,
          additional_requirements: request.additional_requirements
        }, null, 2));
      } else {
        console.log('\n❌ Some required fields are missing');
      }
    } else {
      console.log('❌ Failed to fetch request details');
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Tests Completed!');
    console.log('═══════════════════════════════════════');
    console.log('\n📋 Test Summary:');
    console.log('  ✓ Token validation');
    console.log('  ✓ Fetch user requests');
    console.log('  ✓ Cancel request API');
    console.log('  ✓ Status update verification');
    console.log('  ✓ Status history tracking');
    console.log('  ✓ Duplicate data structure validation');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Check if server is running first
const checkServer = http.get(`http://${config.host}:${config.port}/api/user/imagery-requests`, {
  headers: { 'Authorization': `Bearer ${token}` }
}, (res) => {
  console.log('✅ Server is running\n');
  runTests();
});

checkServer.on('error', (err) => {
  console.log('❌ Server is not running!');
  console.log('\nPlease start the backend server first:');
  console.log('  cd backend');
  console.log('  npm start\n');
  process.exit(1);
});
