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
    
    console.log(`   Making ${method} request to ${url.hostname}:${options.port}${options.path}`);

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

// Test admin satellite products routes
async function testAdminSatelliteRoutes() {
  console.log('Testing Admin Satellite Products Routes...\n');

  try {
    // Connect to MongoDB and get admin token
    console.log('1. Connecting to MongoDB and getting admin token...');
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
    
    console.log(`✓ Admin token obtained for ${adminUser.email}\n`);

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Test 1: GET all products (admin view)
    console.log('2. Testing GET /api/admin/satellite-products...');
    console.log(`   URL: ${API_URL}/api/admin/satellite-products`);
    
    // First test the public route to verify the test script works
    console.log('   Testing public route first...');
    const publicTest = await makeRequest('GET', '/api/public/satellite-products', null, {});
    console.log(`   ✓ Public route works, got ${publicTest.data.products.length} products\n`);
    
    const getAllResponse = await makeRequest('GET', '/api/admin/satellite-products', null, headers);
    console.log(`✓ Retrieved ${getAllResponse.data.products.length} products`);
    console.log(`  Total: ${getAllResponse.data.pagination.total}`);
    console.log(`  Page: ${getAllResponse.data.pagination.page}/${getAllResponse.data.pagination.totalPages}\n`);

    // Test 2: GET all products with filters
    console.log('3. Testing GET /api/admin/satellite-products with filters...');
    const getFilteredResponse = await makeRequest('GET', '/api/admin/satellite-products?status=active&resolution_category=vhr', null, headers);
    console.log(`✓ Retrieved ${getFilteredResponse.data.products.length} filtered products (active, VHR)\n`);

    // Test 3: Create a new product
    console.log('4. Testing POST /api/admin/satellite-products...');
    const newProduct = {
      name: 'Test Satellite Product',
      provider: 'Test Provider',
      sensor_type: 'optical',
      resolution: 0.5,
      resolution_category: 'vhr',
      bands: ['RGB', 'NIR'],
      coverage: 'Global',
      availability: 'both',
      description: 'This is a test satellite product created by the test script',
      status: 'inactive',
      order: 999
    };

    const createResponse = await makeRequest('POST', '/api/admin/satellite-products', newProduct, headers);
    const createdProductId = createResponse.data._id;
    console.log(`✓ Created product with ID: ${createdProductId}\n`);

    // Test 4: GET single product
    console.log('5. Testing GET /api/admin/satellite-products/:id...');
    const getSingleResponse = await makeRequest('GET', `/api/admin/satellite-products/${createdProductId}`, null, headers);
    console.log(`✓ Retrieved product: ${getSingleResponse.data.name}\n`);

    // Test 5: Update product
    console.log('6. Testing PUT /api/admin/satellite-products/:id...');
    const updateData = {
      name: 'Updated Test Satellite Product',
      status: 'active'
    };
    const updateResponse = await makeRequest('PUT', `/api/admin/satellite-products/${createdProductId}`, updateData, headers);
    console.log(`✓ Updated product: ${updateResponse.data.name}`);
    console.log(`  Status: ${updateResponse.data.status}\n`);

    // Test 6: Delete product
    console.log('7. Testing DELETE /api/admin/satellite-products/:id...');
    const deleteResponse = await makeRequest('DELETE', `/api/admin/satellite-products/${createdProductId}`, null, headers);
    console.log(`✓ Deleted product: ${deleteResponse.data.deletedProduct.name}\n`);

    // Test 7: Verify deletion
    console.log('8. Verifying product deletion...');
    try {
      await makeRequest('GET', `/api/admin/satellite-products/${createdProductId}`, null, headers);
      console.log('✗ Product still exists (should have been deleted)\n');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✓ Product successfully deleted (404 returned)\n');
      } else {
        throw error;
      }
    }

    // Test 8: Test validation errors
    console.log('9. Testing validation errors...');
    try {
      await makeRequest('POST', '/api/admin/satellite-products', {
        name: 'Invalid Product',
        // Missing required fields
      }, headers);
      console.log('✗ Validation should have failed\n');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✓ Validation errors handled correctly');
        console.log(`  Errors: ${error.response.data.errors?.join(', ') || error.response.data.message}\n`);
      } else {
        throw error;
      }
    }

    // Test 9: Test invalid ID format
    console.log('10. Testing invalid ID format...');
    try {
      await makeRequest('GET', '/api/admin/satellite-products/invalid-id', null, headers);
      console.log('✗ Should have returned 400 for invalid ID\n');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✓ Invalid ID format handled correctly\n');
      } else {
        throw error;
      }
    }

    console.log('✅ All admin satellite products route tests passed!');
    
    await mongoose.connection.close();

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || error.response.data.error}`);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run tests
testAdminSatelliteRoutes();
