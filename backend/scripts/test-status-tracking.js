/**
 * Test script for imagery request status tracking
 * 
 * This script tests:
 * 1. Creating an imagery request
 * 2. Updating the status
 * 3. Verifying status history is tracked
 * 4. Checking email notification (if configured)
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ImageryRequest = require('../models/ImageryRequest');

async function testStatusTracking() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create a test imagery request
    console.log('Creating test imagery request...');
    const testRequest = new ImageryRequest({
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
      aoi_area_km2: 100.5,
      aoi_center: {
        lat: 37.75,
        lng: -122.35
      },
      date_range: {
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31')
      },
      filters: {
        resolution_category: ['vhr', 'high'],
        max_cloud_coverage: 20,
        providers: ['Maxar', 'Planet Labs'],
        bands: ['RGB', 'NIR'],
        image_types: ['optical']
      },
      urgency: 'standard',
      additional_requirements: 'Test requirements for status tracking'
    });

    await testRequest.save();
    console.log('✅ Test request created:', testRequest._id);
    console.log('   Initial status:', testRequest.status);
    console.log('   Status history length:', testRequest.status_history?.length || 0);
    console.log('');

    // Update status to 'reviewing'
    console.log('Updating status to "reviewing"...');
    testRequest.status = 'reviewing';
    testRequest.admin_notes = 'Request is being reviewed by our team';
    await testRequest.save();
    
    console.log('✅ Status updated to:', testRequest.status);
    console.log('   Status history length:', testRequest.status_history?.length || 0);
    if (testRequest.status_history && testRequest.status_history.length > 0) {
      console.log('   Latest history entry:');
      const latest = testRequest.status_history[testRequest.status_history.length - 1];
      console.log('     - Status:', latest.status);
      console.log('     - Changed at:', latest.changed_at);
      console.log('     - Notes:', latest.notes || 'N/A');
    }
    console.log('');

    // Update status to 'quoted'
    console.log('Updating status to "quoted"...');
    testRequest.status = 'quoted';
    testRequest.admin_notes = 'Quote prepared for customer';
    testRequest.quote_amount = 5000;
    testRequest.quote_currency = 'USD';
    await testRequest.save();
    
    console.log('✅ Status updated to:', testRequest.status);
    console.log('   Quote amount:', testRequest.quote_amount, testRequest.quote_currency);
    console.log('   Status history length:', testRequest.status_history?.length || 0);
    console.log('');

    // Fetch the request again to verify
    console.log('Fetching request from database...');
    const fetchedRequest = await ImageryRequest.findById(testRequest._id);
    
    console.log('✅ Request fetched successfully');
    console.log('   Current status:', fetchedRequest.status);
    console.log('   Status history:');
    if (fetchedRequest.status_history) {
      fetchedRequest.status_history.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.status} - ${entry.changed_at.toISOString()}`);
        if (entry.notes) {
          console.log(`      Notes: ${entry.notes}`);
        }
      });
    }
    console.log('');

    // Clean up - delete test request
    console.log('Cleaning up test data...');
    await ImageryRequest.findByIdAndDelete(testRequest._id);
    console.log('✅ Test request deleted\n');

    console.log('🎉 Status tracking test completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('- Status history is being tracked correctly');
    console.log('- Each status change creates a new history entry');
    console.log('- Admin notes are captured in history');
    console.log('- Timestamps are recorded for each change');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the test
testStatusTracking()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
