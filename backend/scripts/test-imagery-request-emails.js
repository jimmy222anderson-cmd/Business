/**
 * Test script for imagery request email notifications
 * 
 * This script tests:
 * 1. Submitting an imagery request
 * 2. Verifying confirmation email is sent to user
 * 3. Verifying notification email is sent to admin
 * 
 * Usage: node backend/scripts/test-imagery-request-emails.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const ImageryRequest = require('../models/ImageryRequest');
const { sendImageryRequestConfirmation, sendImageryRequestNotification } = require('../services/emailHelper');

// Test data
const testRequest = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  company: 'Test Company Inc.',
  phone: '+1-555-0123',
  aoi_type: 'polygon',
  aoi_coordinates: {
    type: 'Polygon',
    coordinates: [[
      [-122.4194, 37.7749],
      [-122.4194, 37.8049],
      [-122.3894, 37.8049],
      [-122.3894, 37.7749],
      [-122.4194, 37.7749]
    ]]
  },
  aoi_area_km2: 12.5,
  aoi_center: {
    lat: 37.7899,
    lng: -122.4044
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
  urgency: 'urgent',
  additional_requirements: 'Need high-resolution imagery for urban planning project. Prefer recent captures with minimal cloud coverage.',
  status: 'pending'
};

async function testEmailNotifications() {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not configured in .env file');
      console.log('⚠️  Skipping database operations, testing email functions only\n');
      
      // Create a mock request object for testing
      const mockRequest = {
        _id: '507f1f77bcf86cd799439011',
        ...testRequest,
        created_at: new Date()
      };
      
      console.log('📧 Testing confirmation email to user...');
      try {
        await sendImageryRequestConfirmation(
          mockRequest.email,
          mockRequest.full_name,
          mockRequest
        );
        console.log('✅ Confirmation email sent successfully to:', mockRequest.email);
      } catch (error) {
        console.error('❌ Failed to send confirmation email:', error.message);
      }
      console.log();

      console.log('📧 Testing notification email to admin...');
      try {
        await sendImageryRequestNotification(mockRequest);
        console.log('✅ Notification email sent successfully to admin');
      } catch (error) {
        console.error('❌ Failed to send notification email:', error.message);
      }
      console.log();
      
      console.log('✅ Email notification tests completed!');
      console.log('\nNote: Check your email service logs to verify emails were sent.');
      console.log('If using Resend or SendGrid, check their dashboards.');
      console.log('If using SMTP, check the console for preview URLs (development mode).');
      return;
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📝 Creating test imagery request...');
    const imageryRequest = new ImageryRequest(testRequest);
    await imageryRequest.save();
    console.log('✅ Imagery request created:', imageryRequest._id);
    console.log('   Status:', imageryRequest.status);
    console.log('   Area:', imageryRequest.aoi_area_km2, 'km²');
    console.log('   Urgency:', imageryRequest.urgency);
    console.log();

    console.log('📧 Testing confirmation email to user...');
    try {
      await sendImageryRequestConfirmation(
        imageryRequest.email,
        imageryRequest.full_name,
        imageryRequest
      );
      console.log('✅ Confirmation email sent successfully to:', imageryRequest.email);
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error.message);
    }
    console.log();

    console.log('📧 Testing notification email to admin...');
    try {
      await sendImageryRequestNotification(imageryRequest);
      console.log('✅ Notification email sent successfully to admin');
    } catch (error) {
      console.error('❌ Failed to send notification email:', error.message);
    }
    console.log();

    console.log('🧹 Cleaning up test data...');
    await ImageryRequest.deleteOne({ _id: imageryRequest._id });
    console.log('✅ Test data cleaned up\n');

    console.log('✅ All email notification tests completed!');
    console.log('\nNote: Check your email service logs to verify emails were sent.');
    console.log('If using Resend or SendGrid, check their dashboards.');
    console.log('If using SMTP, check the console for preview URLs (development mode).');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run the test
testEmailNotifications()
  .then(() => {
    console.log('\n✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
