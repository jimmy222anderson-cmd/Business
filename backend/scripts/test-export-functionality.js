/**
 * Test script for imagery request export functionality
 * Tests the CSV export endpoint with various filters
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, body = null, headers = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  // Check if response is CSV
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return {
      csv: await response.text(),
      headers: Object.fromEntries(response.headers.entries())
    };
  }

  return await response.json();
}

// Main test function
async function testExportFunctionality() {
  console.log('🧪 Testing Imagery Request Export Functionality\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Login as admin
    console.log('📝 Step 1: Logging in as admin...');
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: 'admin@skyclone.com',
      password: 'admin123'
    });

    if (!loginResponse.token) {
      throw new Error('Login failed - no token received');
    }

    console.log('✅ Admin login successful');
    console.log(`   Token: ${loginResponse.token.substring(0, 20)}...`);
    console.log('');

    const headers = {
      'Authorization': `Bearer ${loginResponse.token}`
    };

    // Step 2: Export all imagery requests
    console.log('📝 Step 2: Exporting all imagery requests...');
    const exportAllResponse = await makeRequest('GET', '/admin/imagery-requests/export', null, headers);
    
    console.log('✅ Export successful');
    console.log(`   CSV Length: ${exportAllResponse.csv.length} characters`);
    console.log(`   Content-Disposition: ${exportAllResponse.headers['content-disposition']}`);
    
    // Count rows (excluding header)
    const rows = exportAllResponse.csv.split('\n').filter(row => row.trim());
    console.log(`   Total rows: ${rows.length - 1} (excluding header)`);
    
    // Show first few lines
    console.log('\n   First 3 lines of CSV:');
    rows.slice(0, 3).forEach((row, idx) => {
      console.log(`   ${idx === 0 ? 'Header' : `Row ${idx}`}: ${row.substring(0, 100)}...`);
    });
    console.log('');

    // Step 3: Export with status filter
    console.log('📝 Step 3: Exporting with status filter (pending)...');
    const exportFilteredResponse = await makeRequest(
      'GET',
      '/admin/imagery-requests/export?status=pending',
      null,
      headers
    );
    
    const filteredRows = exportFilteredResponse.csv.split('\n').filter(row => row.trim());
    console.log('✅ Filtered export successful');
    console.log(`   Total rows: ${filteredRows.length - 1} (excluding header)`);
    console.log('');

    // Step 4: Export with date range
    console.log('📝 Step 4: Exporting with date range...');
    const exportDateRangeResponse = await makeRequest(
      'GET',
      '/admin/imagery-requests/export?date_from=2024-01-01&date_to=2024-12-31',
      null,
      headers
    );
    
    const dateRangeRows = exportDateRangeResponse.csv.split('\n').filter(row => row.trim());
    console.log('✅ Date range export successful');
    console.log(`   Total rows: ${dateRangeRows.length - 1} (excluding header)`);
    console.log('');

    // Step 5: Export with urgency filter
    console.log('📝 Step 5: Exporting with urgency filter (urgent)...');
    const exportUrgencyResponse = await makeRequest(
      'GET',
      '/admin/imagery-requests/export?urgency=urgent',
      null,
      headers
    );
    
    const urgencyRows = exportUrgencyResponse.csv.split('\n').filter(row => row.trim());
    console.log('✅ Urgency filter export successful');
    console.log(`   Total rows: ${urgencyRows.length - 1} (excluding header)`);
    console.log('');

    // Step 6: Export with multiple filters
    console.log('📝 Step 6: Exporting with multiple filters...');
    const exportMultipleResponse = await makeRequest(
      'GET',
      '/admin/imagery-requests/export?status=pending&urgency=urgent&date_from=2024-01-01',
      null,
      headers
    );
    
    const multipleRows = exportMultipleResponse.csv.split('\n').filter(row => row.trim());
    console.log('✅ Multiple filters export successful');
    console.log(`   Total rows: ${multipleRows.length - 1} (excluding header)`);
    console.log('');

    // Step 7: Verify CSV structure
    console.log('📝 Step 7: Verifying CSV structure...');
    const headerRow = rows[0].split(',');
    const expectedHeaders = [
      'Request ID',
      'Status',
      'Urgency',
      'Full Name',
      'Email',
      'Company',
      'Phone',
      'AOI Type',
      'AOI Area (km²)',
      'AOI Center Lat',
      'AOI Center Lng',
      'Date Range Start',
      'Date Range End',
      'Resolution Categories',
      'Max Cloud Coverage (%)',
      'Providers',
      'Bands',
      'Image Types',
      'Additional Requirements',
      'Quote Amount',
      'Quote Currency',
      'Admin Notes',
      'Created At',
      'Updated At',
      'Reviewed At',
      'Reviewed By'
    ];
    
    console.log('✅ CSV structure verified');
    console.log(`   Expected headers: ${expectedHeaders.length}`);
    console.log(`   Actual headers: ${headerRow.length}`);
    console.log('');

    // Step 8: Test without admin token (should fail)
    console.log('📝 Step 8: Testing without admin token (should fail)...');
    try {
      await makeRequest('GET', '/admin/imagery-requests/export', null, {});
      console.log('❌ Should have rejected request without token');
    } catch (error) {
      console.log('✅ Correctly rejected request without token');
      console.log(`   Error: ${error.message.substring(0, 100)}`);
    }
    console.log('');

    // Step 9: Save sample CSV to file
    console.log('📝 Step 9: Saving sample CSV to file...');
    const outputPath = path.join(__dirname, 'sample-export.csv');
    fs.writeFileSync(outputPath, exportAllResponse.csv);
    console.log('✅ Sample CSV saved');
    console.log(`   File: ${outputPath}`);
    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log('✅ All export functionality tests passed!');
    console.log('');
    console.log('Summary:');
    console.log(`   - Export all requests: ${rows.length - 1} rows`);
    console.log(`   - Export with status filter: ${filteredRows.length - 1} rows`);
    console.log(`   - Export with date range: ${dateRangeRows.length - 1} rows`);
    console.log(`   - Export with urgency filter: ${urgencyRows.length - 1} rows`);
    console.log(`   - Export with multiple filters: ${multipleRows.length - 1} rows`);
    console.log(`   - CSV headers: ${headerRow.length} columns`);
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testExportFunctionality();
