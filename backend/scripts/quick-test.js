/**
 * Quick test script to verify basic functionality
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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

async function runQuickTests() {
  console.log('\n========================================');
  console.log('QUICK BACKEND TEST');
  console.log('========================================\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const health = await makeRequest('GET', '/api/health');
    if (health.status === 200) {
      console.log('   ✓ Server is running');
      console.log(`   Response: ${JSON.stringify(health.data)}`);
    } else {
      console.log(`   ✗ Health check failed: ${health.status}`);
      return;
    }

    // Test 2: Sign Up
    console.log('\n2. Testing Sign Up...');
    const signupData = {
      fullName: 'Test User',
      email: `test${Date.now()}@example.com`,
      companyName: 'Test Company',
      password: 'TestPass123!'
    };
    const signup = await makeRequest('POST', '/api/auth/signup', signupData);
    console.log(`   Status: ${signup.status}`);
    console.log(`   Response: ${JSON.stringify(signup.data).substring(0, 150)}...`);
    
    if (signup.status === 201 && signup.data.token) {
      console.log('   ✓ Sign up successful');
      const token = signup.data.token;

      // Test 3: Get Current User
      console.log('\n3. Testing Get Current User...');
      const meReq = http.request(new URL('/api/auth/me', BASE_URL), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response: ${body.substring(0, 150)}...`);
          if (res.statusCode === 200) {
            console.log('   ✓ Authentication working');
          }
        });
      });
      meReq.end();
    } else {
      console.log('   ✗ Sign up failed');
    }

    // Test 4: Demo Booking
    console.log('\n4. Testing Demo Booking...');
    const demoData = {
      fullName: 'Demo User',
      email: 'demo@example.com',
      companyName: 'Demo Company',
      phoneNumber: '+1234567890',
      jobTitle: 'Manager',
      message: 'Test booking'
    };
    const demo = await makeRequest('POST', '/api/demo/book', demoData);
    console.log(`   Status: ${demo.status}`);
    console.log(`   Response: ${JSON.stringify(demo.data).substring(0, 150)}...`);
    if (demo.status === 201) {
      console.log('   ✓ Demo booking successful');
    } else {
      console.log('   ✗ Demo booking failed');
    }

    console.log('\n========================================');
    console.log('QUICK TEST COMPLETE');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('Make sure the backend server is running on port 3000\n');
  }
}

runQuickTests();
