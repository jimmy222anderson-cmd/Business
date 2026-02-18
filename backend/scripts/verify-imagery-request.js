/**
 * Verify imagery request was created correctly in database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ImageryRequest = require('../models/ImageryRequest');

async function verifyRequest() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the most recent request
    const request = await ImageryRequest.findOne().sort({ created_at: -1 });

    if (!request) {
      console.log('No imagery requests found in database');
      process.exit(1);
    }

    console.log('\n=== Most Recent Imagery Request ===');
    console.log('ID:', request._id);
    console.log('Full Name:', request.full_name);
    console.log('Email:', request.email);
    console.log('Company:', request.company);
    console.log('Phone:', request.phone);
    console.log('\nAOI Details:');
    console.log('Type:', request.aoi_type);
    console.log('Area:', request.aoi_area_km2, 'km²');
    console.log('Center:', request.aoi_center);
    console.log('Coordinates:', JSON.stringify(request.aoi_coordinates, null, 2));
    console.log('\nDate Range:');
    console.log('Start:', request.date_range.start_date);
    console.log('End:', request.date_range.end_date);
    console.log('\nFilters:');
    console.log('Resolution Categories:', request.filters.resolution_category);
    console.log('Max Cloud Coverage:', request.filters.max_cloud_coverage);
    console.log('Providers:', request.filters.providers);
    console.log('Bands:', request.filters.bands);
    console.log('Image Types:', request.filters.image_types);
    console.log('\nRequest Details:');
    console.log('Urgency:', request.urgency);
    console.log('Status:', request.status);
    console.log('Additional Requirements:', request.additional_requirements);
    console.log('\nTimestamps:');
    console.log('Created:', request.created_at);
    console.log('Updated:', request.updated_at);

    // Verify all required fields are present
    const requiredFields = [
      'full_name', 'email', 'aoi_type', 'aoi_coordinates',
      'aoi_area_km2', 'aoi_center', 'date_range', 'urgency', 'status'
    ];

    const missingFields = requiredFields.filter(field => !request[field]);
    
    if (missingFields.length > 0) {
      console.log('\n✗ Missing required fields:', missingFields);
      process.exit(1);
    }

    console.log('\n✓ All required fields present');
    console.log('✓ Request successfully stored in database');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyRequest();
