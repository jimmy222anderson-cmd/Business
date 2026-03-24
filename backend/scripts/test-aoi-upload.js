const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Sample KML content
const sampleKML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Test AOI</name>
    <Placemark>
      <name>Test Polygon</name>
      <description>A test polygon for AOI upload</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -122.4,37.8,0
              -122.4,37.7,0
              -122.3,37.7,0
              -122.3,37.8,0
              -122.4,37.8,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;

// Sample GeoJSON content
const sampleGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Test Polygon"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.4, 37.8],
            [-122.4, 37.7],
            [-122.3, 37.7],
            [-122.3, 37.8],
            [-122.4, 37.8]
          ]
        ]
      }
    }
  ]
};

async function testKMLUpload() {
  console.log('\n=== Testing KML Upload ===');
  
  try {
    // Create temporary KML file
    const tempKMLPath = path.join(__dirname, 'temp-test.kml');
    fs.writeFileSync(tempKMLPath, sampleKML);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempKMLPath));
    
    const response = await axios.post(
      `${API_URL}/api/public/upload-aoi`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    console.log('✓ KML upload successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Clean up
    fs.unlinkSync(tempKMLPath);
    
    return true;
  } catch (error) {
    console.error('✗ KML upload failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

async function testGeoJSONUpload() {
  console.log('\n=== Testing GeoJSON Upload ===');
  
  try {
    // Create temporary GeoJSON file
    const tempGeoJSONPath = path.join(__dirname, 'temp-test.geojson');
    fs.writeFileSync(tempGeoJSONPath, JSON.stringify(sampleGeoJSON, null, 2));
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempGeoJSONPath));
    
    const response = await axios.post(
      `${API_URL}/api/public/upload-aoi`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    console.log('✓ GeoJSON upload successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Clean up
    fs.unlinkSync(tempGeoJSONPath);
    
    return true;
  } catch (error) {
    console.error('✗ GeoJSON upload failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

async function testInvalidFileType() {
  console.log('\n=== Testing Invalid File Type ===');
  
  try {
    // Create temporary text file
    const tempTxtPath = path.join(__dirname, 'temp-test.txt');
    fs.writeFileSync(tempTxtPath, 'This is not a valid KML or GeoJSON file');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempTxtPath));
    
    const response = await axios.post(
      `${API_URL}/api/public/upload-aoi`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    console.log('✗ Should have rejected invalid file type');
    console.log('Response:', response.data);
    
    // Clean up
    fs.unlinkSync(tempTxtPath);
    
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ Correctly rejected invalid file type');
      console.log('Error message:', error.response.data.message);
      
      // Clean up
      const tempTxtPath = path.join(__dirname, 'temp-test.txt');
      if (fs.existsSync(tempTxtPath)) {
        fs.unlinkSync(tempTxtPath);
      }
      
      return true;
    } else {
      console.error('✗ Unexpected error');
      console.error('Error:', error.message);
      return false;
    }
  }
}

async function testFileSizeLimit() {
  console.log('\n=== Testing File Size Limit (5MB) ===');
  
  try {
    // Create a large file (>5MB)
    const tempLargePath = path.join(__dirname, 'temp-large.geojson');
    const largeContent = {
      type: "FeatureCollection",
      features: []
    };
    
    // Add many features to exceed 5MB
    for (let i = 0; i < 100000; i++) {
      largeContent.features.push({
        type: "Feature",
        properties: { id: i, name: `Feature ${i}`, description: 'A'.repeat(100) },
        geometry: {
          type: "Point",
          coordinates: [Math.random() * 360 - 180, Math.random() * 180 - 90]
        }
      });
    }
    
    fs.writeFileSync(tempLargePath, JSON.stringify(largeContent));
    const fileSize = fs.statSync(tempLargePath).size;
    console.log(`Created test file of size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (fileSize <= 5 * 1024 * 1024) {
      console.log('⚠ Test file is not large enough, skipping test');
      fs.unlinkSync(tempLargePath);
      return true;
    }
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempLargePath));
    
    const response = await axios.post(
      `${API_URL}/api/public/upload-aoi`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    console.log('✗ Should have rejected file exceeding size limit');
    console.log('Response:', response.data);
    
    // Clean up
    fs.unlinkSync(tempLargePath);
    
    return false;
  } catch (error) {
    if (error.response && error.response.status === 413) {
      console.log('✓ Correctly rejected file exceeding size limit');
      console.log('Error message:', error.response.data.message);
      
      // Clean up
      const tempLargePath = path.join(__dirname, 'temp-large.geojson');
      if (fs.existsSync(tempLargePath)) {
        fs.unlinkSync(tempLargePath);
      }
      
      return true;
    } else {
      console.error('✗ Unexpected error');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Error:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
      
      // Clean up
      const tempLargePath = path.join(__dirname, 'temp-large.geojson');
      if (fs.existsSync(tempLargePath)) {
        fs.unlinkSync(tempLargePath);
      }
      
      return false;
    }
  }
}

async function testNoFile() {
  console.log('\n=== Testing No File Provided ===');
  
  try {
    const formData = new FormData();
    
    const response = await axios.post(
      `${API_URL}/api/public/upload-aoi`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    console.log('✗ Should have rejected request with no file');
    console.log('Response:', response.data);
    
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ Correctly rejected request with no file');
      console.log('Error message:', error.response.data.message);
      return true;
    } else {
      console.error('✗ Unexpected error');
      console.error('Error:', error.message);
      return false;
    }
  }
}

async function runTests() {
  console.log('Starting AOI Upload Tests...');
  console.log('API URL:', API_URL);
  
  const results = {
    kml: await testKMLUpload(),
    geojson: await testGeoJSONUpload(),
    invalidType: await testInvalidFileType(),
    sizeLimit: await testFileSizeLimit(),
    noFile: await testNoFile()
  };
  
  console.log('\n=== Test Summary ===');
  console.log('KML Upload:', results.kml ? '✓ PASS' : '✗ FAIL');
  console.log('GeoJSON Upload:', results.geojson ? '✓ PASS' : '✗ FAIL');
  console.log('Invalid File Type:', results.invalidType ? '✓ PASS' : '✗ FAIL');
  console.log('File Size Limit:', results.sizeLimit ? '✓ PASS' : '✗ FAIL');
  console.log('No File Provided:', results.noFile ? '✓ PASS' : '✗ FAIL');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  console.log(`\nTotal: ${passedTests}/${totalTests} tests passed`);
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

runTests();
