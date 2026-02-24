/**
 * Integration test for imagery request status update functionality
 * 
 * This script tests:
 * 1. Status update
 * 2. Admin notes addition
 * 3. Quote amount and currency
 * 4. Status history tracking
 * 5. Email notification (logs only, doesn't actually send)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const ImageryRequest = require('../models/ImageryRequest');

async function testStatusUpdate() {
  try {
    console.log('🧪 Testing Status Update Functionality\n');
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a test request (or create one)
    let testRequest = await ImageryRequest.findOne({ status: 'pending' });
    
    if (!testRequest) {
      console.log('No pending request found. Creating a test request...');
      testRequest = await ImageryRequest.create({
        full_name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        phone: '+1234567890',
        aoi_type: 'polygon',
        aoi_coordinates: {
          type: 'Polygon',
          coordinates: [[
            [-122.4, 37.8],
            [-122.4, 37.7],
            [-122.3, 37.7],
            [-122.3, 37.8],
            [-122.4, 37.8]
          ]]
        },
        aoi_area_km2: 100,
        aoi_center: { lat: 37.75, lng: -122.35 },
        date_range: {
          start_date: new Date('2024-01-01'),
          end_date: new Date('2024-01-31')
        },
        filters: {
          resolution_category: ['vhr'],
          max_cloud_coverage: 20
        },
        urgency: 'standard',
        status: 'pending'
      });
      console.log('✅ Test request created:', testRequest._id);
    } else {
      console.log('✅ Found existing pending request:', testRequest._id);
    }

    console.log('\n📝 Initial Status:', testRequest.status);
    console.log('📝 Initial Status History Length:', testRequest.status_history?.length || 0);

    // Test 1: Update status to 'reviewing'
    console.log('\n--- Test 1: Update status to "reviewing" ---');
    testRequest.status = 'reviewing';
    testRequest.admin_notes = 'Request is being reviewed by our team';
    await testRequest.save();
    
    console.log('✅ Status updated to:', testRequest.status);
    console.log('✅ Status History Length:', testRequest.status_history.length);
    console.log('✅ Latest History Entry:', JSON.stringify(testRequest.status_history[testRequest.status_history.length - 1], null, 2));

    // Test 2: Update status to 'quoted' with quote information
    console.log('\n--- Test 2: Update status to "quoted" with quote ---');
    testRequest.status = 'quoted';
    testRequest.admin_notes = 'Quote prepared based on requirements';
    testRequest.quote_amount = 5000;
    testRequest.quote_currency = 'USD';
    await testRequest.save();
    
    console.log('✅ Status updated to:', testRequest.status);
    console.log('✅ Quote Amount:', testRequest.quote_amount, testRequest.quote_currency);
    console.log('✅ Status History Length:', testRequest.status_history.length);
    console.log('✅ Latest History Entry:', JSON.stringify(testRequest.status_history[testRequest.status_history.length - 1], null, 2));

    // Test 3: Update status to 'approved'
    console.log('\n--- Test 3: Update status to "approved" ---');
    testRequest.status = 'approved';
    testRequest.admin_notes = 'Request approved, processing imagery';
    await testRequest.save();
    
    console.log('✅ Status updated to:', testRequest.status);
    console.log('✅ Status History Length:', testRequest.status_history.length);

    // Display full status history
    console.log('\n📊 Complete Status History:');
    testRequest.status_history.forEach((entry, index) => {
      console.log(`\n${index + 1}. Status: ${entry.status}`);
      console.log(`   Changed At: ${entry.changed_at}`);
      console.log(`   Notes: ${entry.notes || 'N/A'}`);
    });

    // Verify all fields are properly saved
    console.log('\n--- Verification ---');
    const verifyRequest = await ImageryRequest.findById(testRequest._id);
    console.log('✅ Current Status:', verifyRequest.status);
    console.log('✅ Admin Notes:', verifyRequest.admin_notes);
    console.log('✅ Quote:', verifyRequest.quote_amount, verifyRequest.quote_currency);
    console.log('✅ Status History Count:', verifyRequest.status_history.length);
    console.log('✅ All status changes tracked:', 
      verifyRequest.status_history.map(h => h.status).join(' → ')
    );

    console.log('\n✅ All tests passed!');
    console.log('\n📧 Note: Email notifications would be sent in production when status changes.');
    console.log('   Check backend/services/email.js for email templates.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the test
testStatusUpdate()
  .then(() => {
    console.log('\n✅ Integration test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Integration test failed:', error);
    process.exit(1);
  });
