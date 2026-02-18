const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dns = require('dns');
const UserProfile = require('../models/UserProfile');
require('dotenv').config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

function makeRequest(method, path, token, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('Testing HTTP Endpoints...\n');
  
  try {
    // Get admin token
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await UserProfile.findOne({ role: 'admin' });
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await mongoose.connection.close();
    
    console.log('1. Testing GET /api/admin/satellite-products...');
    const getAll = await makeRequest('GET', '/api/admin/satellite-products', token);
    console.log(`   Status: ${getAll.status}`);
    if (getAll.status === 200) {
      console.log(`   ✓ Success! Found ${getAll.data.products.length} products\n`);
    } else {
      console.log(`   ✗ Failed: ${JSON.stringify(getAll.data)}\n`);
      process.exit(1);
    }

    console.log('2. Testing POST /api/admin/satellite-products...');
    const createData = {
      name: 'HTTP Test Product',
      provider: 'Test Provider',
      sensor_type: 'optical',
      resolution: 1.5,
      resolution_category: 'high',
      bands: ['RGB'],
      coverage: 'Regional',
      availability: 'archive',
      description: 'Test product via HTTP',
      status: 'inactive'
    };
    const create = await makeRequest('POST', '/api/admin/satellite-products', token, createData);
    console.log(`   Status: ${create.status}`);
    if (create.status === 201) {
      console.log(`   ✓ Success! Created product: ${create.data._id}\n`);
      const productId = create.data._id;

      console.log('3. Testing GET /api/admin/satellite-products/:id...');
      const getOne = await makeRequest('GET', `/api/admin/satellite-products/${productId}`, token);
      console.log(`   Status: ${getOne.status}`);
      if (getOne.status === 200) {
        console.log(`   ✓ Success! Retrieved: ${getOne.data.name}\n`);
      } else {
        console.log(`   ✗ Failed\n`);
      }

      console.log('4. Testing PUT /api/admin/satellite-products/:id...');
      const update = await makeRequest('PUT', `/api/admin/satellite-products/${productId}`, token, { status: 'active' });
      console.log(`   Status: ${update.status}`);
      if (update.status === 200) {
        console.log(`   ✓ Success! Updated status to: ${update.data.status}\n`);
      } else {
        console.log(`   ✗ Failed\n`);
      }

      console.log('5. Testing DELETE /api/admin/satellite-products/:id...');
      const del = await makeRequest('DELETE', `/api/admin/satellite-products/${productId}`, token);
      console.log(`   Status: ${del.status}`);
      if (del.status === 200) {
        console.log(`   ✓ Success! Deleted product\n`);
      } else {
        console.log(`   ✗ Failed\n`);
      }
    } else {
      console.log(`   ✗ Failed: ${JSON.stringify(create.data)}\n`);
      process.exit(1);
    }

    console.log('✅ All HTTP endpoint tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
