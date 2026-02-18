const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dns = require('dns');
require('dotenv').config();

// Fix DNS resolution for MongoDB Atlas on Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
dns.setDefaultResultOrder('ipv4first');

const UserProfile = require('../models/UserProfile');
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          };
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            const error = new Error(`HTTP ${res.statusCode}`);
            error.response = response;
            reject(error);
          }
        } catch (e) {
          reject(e);
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

// Test admin imagery requests routes
async function runTests() {
  console.log('🧪 Testing Admin Imagery Requests API\n');
  console.log('=' .repeat(60));

  let testRequestId = null;

  try {
    // Step 1: Connect to MongoDB and get admin token
    console.log('\n📝 Step 1: Connecting to MongoDB and getting admin token...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    const adminUser = await UserProfile.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('No admin user found in database');
    }

    const token = jwt.sign(
      { userId: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`✅ Admin token obtained for ${adminUser.email}`);

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Step 2: Create a test imagery request (as public user)
    console.log('\n📝 Step 2: Creating test imagery request...');
    const createResponse = await makeRequest('POST', '/api/public/imagery-requests', {
      full_name: 'Test Admin User',
      email: 'testadmin@example.com',
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
        bands: ['RGB', 'NIR'],
        image_types: ['optical']
      },
      urgency: 'urgent',
      additional_requirements: 'Test request for admin API testing'
    }, {});

    testRequestId = createResponse.data.request_id;
    console.log('✅ Test request created:', testRequestId);

    // Step 3: Get all imagery requests (admin)
    console.log('\n📝 Step 3: Getting all imagery requests...');
    const getAllResponse = await makeRequest('GET', '/api/admin/imagery-requests?limit=10', null, headers);

    console.log('✅ Retrieved imagery requests');
    console.log(`   Total: ${getAllResponse.data.pagination.total}`);
    console.log(`   Page: ${getAllResponse.data.pagination.page}`);
    console.log(`   Requests on this page: ${getAllResponse.data.requests.length}`);

    // Step 4: Get imagery requests with filters
    console.log('\n📝 Step 4: Getting imagery requests with filters...');
    const getFilteredResponse = await makeRequest(
      'GET',
      '/api/admin/imagery-requests?status=pending&urgency=urgent',
      null,
      headers
    );

    console.log('✅ Retrieved filtered imagery requests');
    console.log(`   Pending urgent requests: ${getFilteredResponse.data.requests.length}`);

    // Step 5: Get single imagery request
    console.log('\n📝 Step 5: Getting single imagery request...');
    const getSingleResponse = await makeRequest(
      'GET',
      `/api/admin/imagery-requests/${testRequestId}`,
      null,
      headers
    );

    console.log('✅ Retrieved single imagery request');
    console.log(`   ID: ${getSingleResponse.data.request._id}`);
    console.log(`   Status: ${getSingleResponse.data.request.status}`);
    console.log(`   Email: ${getSingleResponse.data.request.email}`);
    console.log(`   AOI Area: ${getSingleResponse.data.request.aoi_area_km2} km²`);

    // Step 6: Update imagery request status
    console.log('\n📝 Step 6: Updating imagery request status...');
    const updateResponse = await makeRequest(
      'PUT',
      `/api/admin/imagery-requests/${testRequestId}`,
      {
        status: 'reviewing',
        admin_notes: 'Request is being reviewed by the team'
      },
      headers
    );

    console.log('✅ Updated imagery request status');
    console.log(`   New status: ${updateResponse.data.request.status}`);
    console.log(`   Admin notes: ${updateResponse.data.request.admin_notes}`);

    // Step 7: Update with quote
    console.log('\n📝 Step 7: Adding quote to imagery request...');
    const quoteResponse = await makeRequest(
      'PUT',
      `/api/admin/imagery-requests/${testRequestId}`,
      {
        status: 'quoted',
        admin_notes: 'Quote has been prepared',
        quote_amount: 5000,
        quote_currency: 'USD'
      },
      headers
    );

    console.log('✅ Added quote to imagery request');
    console.log(`   Status: ${quoteResponse.data.request.status}`);
    console.log(`   Quote: ${quoteResponse.data.request.quote_currency} ${quoteResponse.data.request.quote_amount}`);

    // Step 8: Test invalid status
    console.log('\n📝 Step 8: Testing invalid status (should fail)...');
    try {
      await makeRequest(
        'PUT',
        `/api/admin/imagery-requests/${testRequestId}`,
        {
          status: 'invalid_status'
        },
        headers
      );
      console.log('❌ Should have rejected invalid status');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected invalid status');
      } else {
        throw error;
      }
    }

    // Step 9: Test without admin token (should fail)
    console.log('\n📝 Step 9: Testing without admin token (should fail)...');
    try {
      await makeRequest('GET', '/api/admin/imagery-requests', null, {});
      console.log('❌ Should have rejected request without token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly rejected request without token');
      } else {
        throw error;
      }
    }

    // Step 10: Test date range filter
    console.log('\n📝 Step 10: Testing date range filter...');
    const dateFilterResponse = await makeRequest(
      'GET',
      '/api/admin/imagery-requests?date_from=2024-01-01&date_to=2024-12-31',
      null,
      headers
    );

    console.log('✅ Date range filter works');
    console.log(`   Requests in date range: ${dateFilterResponse.data.requests.length}`);

    // Step 11: Test sorting
    console.log('\n📝 Step 11: Testing sorting...');
    const sortResponse = await makeRequest(
      'GET',
      '/api/admin/imagery-requests?sort=urgency&order=desc',
      null,
      headers
    );

    console.log('✅ Sorting works');
    console.log(`   Sorted requests: ${sortResponse.data.requests.length}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(60));

    await mongoose.connection.close();

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || error.response.data.error}`);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
      console.error(error);
    }

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run tests
console.log('Starting Admin Imagery Requests API tests...');
console.log('Make sure the backend server is running on http://localhost:5000\n');

runTests().catch(console.error);
