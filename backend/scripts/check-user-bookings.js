/**
 * Script to check user bookings in database
 * Run with: node scripts/check-user-bookings.js
 */

require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const DemoBooking = require('../models/DemoBooking');
const UserProfile = require('../models/UserProfile');

// Fix DNS resolution for MongoDB Atlas on Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

async function checkUserBookings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users
    const users = await UserProfile.find().select('_id email full_name');
    console.log(`📊 Found ${users.length} users:\n`);
    
    for (const user of users) {
      console.log(`User: ${user.full_name || 'N/A'} (${user.email})`);
      console.log(`User ID: ${user._id}`);
      
      // Find bookings for this user
      const bookings = await DemoBooking.find({ user_id: user._id });
      console.log(`  📅 Demo Bookings: ${bookings.length}`);
      
      if (bookings.length > 0) {
        bookings.forEach((booking, index) => {
          console.log(`    ${index + 1}. ${booking.fullName} - ${booking.email} (Status: ${booking.status})`);
          console.log(`       Created: ${booking.created_at}`);
        });
      }
      console.log('');
    }

    // Find all bookings without user_id
    const orphanedBookings = await DemoBooking.find({ 
      $or: [
        { user_id: null },
        { user_id: { $exists: false } }
      ]
    });
    
    console.log(`\n⚠️  Bookings without user_id: ${orphanedBookings.length}`);
    if (orphanedBookings.length > 0) {
      orphanedBookings.forEach((booking, index) => {
        console.log(`  ${index + 1}. ${booking.fullName} - ${booking.email} (Status: ${booking.status})`);
        console.log(`     Created: ${booking.created_at}`);
        console.log(`     ID: ${booking._id}`);
      });
    }

    // Summary
    const totalBookings = await DemoBooking.countDocuments();
    const linkedBookings = await DemoBooking.countDocuments({ user_id: { $exists: true, $ne: null } });
    
    console.log('\n📈 Summary:');
    console.log(`   Total Bookings: ${totalBookings}`);
    console.log(`   Linked to Users: ${linkedBookings}`);
    console.log(`   Orphaned: ${totalBookings - linkedBookings}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkUserBookings();
