const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Fix DNS resolution for MongoDB Atlas on Windows
dns.setDefaultResultOrder('ipv4first');

const UserProfile = require('../models/UserProfile');

async function getAdminToken() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Find an admin user
    console.log('Finding admin user...');
    const adminUser = await UserProfile.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('No admin user found!');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log('Found admin user:', adminUser.full_name, '(', adminUser.email, ')');
    console.log('User ID:', adminUser._id);

    // Generate token
    const token = jwt.sign(
      { userId: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log('\n=== Admin Token ===');
    console.log(token);
    console.log('\nUse this token to test the API');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

getAdminToken();
