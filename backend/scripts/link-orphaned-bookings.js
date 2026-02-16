/**
 * Script to link orphaned bookings to users based on email match
 * Run with: node scripts/link-orphaned-bookings.js
 */

require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const DemoBooking = require('../models/DemoBooking');
const ContactInquiry = require('../models/ContactInquiry');
const QuoteRequest = require('../models/QuoteRequest');
const ProductInquiry = require('../models/ProductInquiry');
const UserProfile = require('../models/UserProfile');

// Fix DNS resolution for MongoDB Atlas on Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

async function linkOrphanedBookings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let totalLinked = 0;

    // Link Demo Bookings
    console.log('🔗 Linking Demo Bookings...');
    const orphanedBookings = await DemoBooking.find({ 
      $or: [
        { user_id: null },
        { user_id: { $exists: false } }
      ]
    });

    for (const booking of orphanedBookings) {
      // Find user by email
      const user = await UserProfile.findOne({ email: booking.email });
      
      if (user) {
        booking.user_id = user._id;
        await booking.save();
        console.log(`  ✅ Linked booking ${booking._id} to user ${user.email}`);
        totalLinked++;
      } else {
        console.log(`  ⚠️  No user found for booking email: ${booking.email}`);
      }
    }

    // Link Contact Inquiries
    console.log('\n🔗 Linking Contact Inquiries...');
    const orphanedInquiries = await ContactInquiry.find({ 
      $or: [
        { user_id: null },
        { user_id: { $exists: false } }
      ]
    });

    for (const inquiry of orphanedInquiries) {
      // Find user by email
      const user = await UserProfile.findOne({ email: inquiry.email });
      
      if (user) {
        inquiry.user_id = user._id;
        await inquiry.save();
        console.log(`  ✅ Linked inquiry ${inquiry._id} to user ${user.email}`);
        totalLinked++;
      } else {
        console.log(`  ⚠️  No user found for inquiry email: ${inquiry.email}`);
      }
    }

    // Link Quote Requests
    console.log('\n🔗 Linking Quote Requests...');
    const orphanedQuotes = await QuoteRequest.find({ 
      $or: [
        { user_id: null },
        { user_id: { $exists: false } }
      ]
    });

    for (const quote of orphanedQuotes) {
      // Find user by email
      const user = await UserProfile.findOne({ email: quote.email });
      
      if (user) {
        quote.user_id = user._id;
        await quote.save();
        console.log(`  ✅ Linked quote ${quote._id} to user ${user.email}`);
        totalLinked++;
      } else {
        console.log(`  ⚠️  No user found for quote email: ${quote.email}`);
      }
    }

    // Link Product Inquiries
    console.log('\n🔗 Linking Product Inquiries...');
    const orphanedProductInquiries = await ProductInquiry.find({ 
      $or: [
        { user_id: null },
        { user_id: { $exists: false } }
      ]
    });

    for (const inquiry of orphanedProductInquiries) {
      // Find user by email
      const user = await UserProfile.findOne({ email: inquiry.email });
      
      if (user) {
        inquiry.user_id = user._id;
        await inquiry.save();
        console.log(`  ✅ Linked product inquiry ${inquiry._id} to user ${user.email}`);
        totalLinked++;
      } else {
        console.log(`  ⚠️  No user found for product inquiry email: ${inquiry.email}`);
      }
    }

    console.log(`\n📊 Summary: Linked ${totalLinked} records to users`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

linkOrphanedBookings();
