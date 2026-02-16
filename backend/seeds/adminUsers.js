/**
 * Seed Admin Users
 * Creates 3 default admin users in the database
 * Run with: node seeds/adminUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserProfile = require('../models/UserProfile');
const dns = require('dns');

// Fix DNS resolution for MongoDB Atlas on Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

// Admin users to seed
const adminUsers = [
  {
    email: 'admin@earthintelligence.com',
    password: 'Admin@123456',
    full_name: 'System Administrator',
    company: 'Earth Intelligence',
    role: 'admin',
    email_verified: true,
  },
  {
    email: 'james.admin@earthintelligence.com',
    password: 'James@123456',
    full_name: 'James Anderson',
    company: 'Earth Intelligence',
    role: 'admin',
    email_verified: true,
  },
  {
    email: 'sarah.admin@earthintelligence.com',
    password: 'Sarah@123456',
    full_name: 'Sarah Mitchell',
    company: 'Earth Intelligence',
    role: 'admin',
    email_verified: true,
  },
];

async function seedAdminUsers() {
  try {
    console.log('🌱 Starting admin user seeding...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const adminData of adminUsers) {
      try {
        // Check if user already exists
        const existingUser = await UserProfile.findOne({ email: adminData.email });

        if (existingUser) {
          console.log(`⏭️  Skipped: ${adminData.email} (already exists)`);
          
          // Update to admin if not already
          if (existingUser.role !== 'admin') {
            existingUser.role = 'admin';
            existingUser.email_verified = true;
            await existingUser.save();
            console.log(`   ↳ Updated to admin role`);
          }
          
          skipped++;
          continue;
        }

        // Hash password
        const password_hash = await bcrypt.hash(adminData.password, 10);

        // Create admin user
        const adminUser = new UserProfile({
          email: adminData.email,
          password_hash,
          password_history: [password_hash],
          full_name: adminData.full_name,
          company: adminData.company,
          role: adminData.role,
          email_verified: adminData.email_verified,
          email_verification_token: null,
        });

        await adminUser.save();
        console.log(`✅ Created: ${adminData.email}`);
        console.log(`   ↳ Name: ${adminData.full_name}`);
        console.log(`   ↳ Password: ${adminData.password}`);
        console.log(`   ↳ Role: ${adminData.role}\n`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${adminData.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);

    if (created > 0) {
      console.log('\n🔐 Admin Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      adminUsers.forEach((admin) => {
        console.log(`\n📧 Email: ${admin.email}`);
        console.log(`🔑 Password: ${admin.password}`);
        console.log(`👤 Name: ${admin.full_name}`);
      });
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n⚠️  IMPORTANT: Change these passwords after first login!');
    }

    console.log('\n✨ Admin user seeding completed!\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seeding
seedAdminUsers();
