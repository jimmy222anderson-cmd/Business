const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Fix DNS resolution for MongoDB Atlas on Windows
dns.setDefaultResultOrder('ipv4first');

const UserProfile = require('../models/UserProfile');
const ImageryRequest = require('../models/ImageryRequest');

async function getTestUserToken() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB\n');

    // Find users with imagery requests
    console.log('Finding users with imagery requests...');
    const requests = await ImageryRequest.find().limit(10);
    
    if (requests.length === 0) {
      console.error('No imagery requests found!');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Get unique user IDs
    const userIds = [...new Set(requests.map(r => r.user_id?.toString()).filter(Boolean))];
    
    if (userIds.length === 0) {
      console.error('No users found with imagery requests!');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Find the first user
    const user = await UserProfile.findById(userIds[0]);
    
    if (!user) {
      console.error('User not found!');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Count user's requests
    const userRequests = await ImageryRequest.find({ user_id: user._id });
    const cancellableCount = userRequests.filter(r => 
      r.status === 'pending' || r.status === 'reviewing'
    ).length;

    console.log('=== Test User Found ===');
    console.log('Name:', user.full_name);
    console.log('Email:', user.email);
    console.log('User ID:', user._id);
    console.log('Total Requests:', userRequests.length);
    console.log('Cancellable Requests:', cancellableCount);
    console.log('\nRequest Statuses:');
    userRequests.forEach((req, idx) => {
      console.log(`  ${idx + 1}. ${req._id} - ${req.status}`);
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log('\n=== Test Token ===');
    console.log(token);
    console.log('\n=== Test Credentials ===');
    console.log('Email:', user.email);
    console.log('(Password: Use the actual password for this user)');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

getTestUserToken();
