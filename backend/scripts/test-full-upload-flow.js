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
      <name>San Francisco Bay Area</name>
      <description>Sample area for testing full flow</description>
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
        name: "San Francisco Bay Area"
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

async function testFullFlowWithKML() {
  console.log('\n=== Testing Full Flow with KML ===');
  
  try {
    // Step 1: Upload KML file
    console.log('Step 1: Uploading KML file...');
    const tempKMLPath = path.join(__dirname, 'temp-flow-test.kml');
    fs.writeFileSync(tempKMLPath, sampleKML);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempKMLPath));
    
    const uploadResponse = await axios.post(
      `${API_URL}/api/public/upload-aoi`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    console.log('✓ KML uploaded successfully');
    console.log('  Geometries found:', uploadResponse.data.data.count);
    
    // Clean up temp file
    fs.unlinkSync(tempKMLPath);
    
    // Step 2: Extract geometry data
    const geometry = uploadResponse.data.data.geometries[0];
    console.log('\nStep 2: Extracting geometry data...');
    console.log('  Type:', geometry.type);
    console.log('  Coordinates:', JSON.stringify(geometry.coordinates[0].slice(0, 2), null, 2));
    
    // Step 3: Calculate area (simplified calculation)
    console.log('\nStep 3: Calculating area...');
    // For this test, we'll use a rough estimate
    const areaKm2 = 123.45; // This would be calculated by the frontend
    console.log('  Area:', areaKm2, 'km²');
    
    // Step 4: Calculate center point
    console.log('\nStep 4: Calculating center point...');
    const coords = geometry.coordinates[0];
    let latSum = 0, lngSum = 0;
    coords.forEach(coord => {
      lngSum += coord[0];
      latSum += coord[1];
    });
    const center = {
      lat: latSum / coords.length,
      lng: lngSum / coords.length
    };
    console.log('  Center:', center);
    
    // Step 5: Submit imagery request
    console.log('\nStep 5: Submitting imagery request...');
    const requestPayload = {
      full_name: "Test User",
      email: "test@example.com",
      company: "Test Company",
      phone: "+1234567890",
      aoi_type: "polygon",
      aoi_coordinates: {
        type: geometry.type,
        coordinates: geometry.coordinates
      },
      aoi_area_km2: areaKm2,
      aoi_center: center,
      date_range: {
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      filters: {
        resolution_category: ["vhr"],
        max_cloud_coverage: 20,
        providers: ["Maxar"],
        bands: ["RGB"],
        image_types: ["optical"]
      },
      urgency: "standard",
      additional_requirements: "Test request from KML upload"
    };
    
    const requestResponse = await axios.post(
      `${API_URL}/api/public/imagery-requests`,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✓ Imagery request submitted successfully');
    console.log('  Request ID:', requestResponse.data.request_id);
    console.log('  Status:', requestResponse.data.request.status);
    
    return true;
  } catch (error) {
    console.error('✗ Full flow test failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    
    // Clean up temp file if it exists
    const tempKMLPath = path.join(__dirname, 'temp-flow-test.kml');
    if (fs.existsSync(tempKMLPath)) {
      fs.unlinkSync(tempKMLPath);
    }
    
    return false;
  }
}

async function testFullFlowWithGeoJSON() {
  console.log('\n=== Testing Full Flow with GeoJSON ===');
  
  try {
    // Step 1: Upload GeoJSON file
    console.log('Step 1: Uploading GeoJSON file...');
    const tempGeoJSONPath = path.join(__dirname, 'temp-flow-test.geojson');
    fs.writeFileSync(tempGeoJSONPath, JSON.stringify(sampleGeoJSON, null, 2));
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempGeoJSONPath));
    
    const uploadResponse = await axios.post(
      `${API_URL}/api/public/upload-aoi`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    console.log('✓ GeoJSON uploaded successfully');
    console.log('  Geometries found:', uploadResponse.data.data.count);
    
    // Clean up temp file
    fs.unlinkSync(tempGeoJSONPath);
    
    // Step 2: Extract geometry data
    const geometry = uploadResponse.data.data.geometries[0];
    console.log('\nStep 2: Extracting geometry data...');
    console.log('  Type:', geometry.type);
    console.log('  Coordinates:', JSON.stringify(geometry.coordinates[0].slice(0, 2), null, 2));
    
    // Step 3: Calculate area (simplified calculation)
    console.log('\nStep 3: Calculating area...');
    const areaKm2 = 123.45;
    console.log('  Area:', areaKm2, 'km²');
    
    // Step 4: Calculate center point
    console.log('\nStep 4: Calculating center point...');
    const coords = geometry.coordinates[0];
    let latSum = 0, lngSum = 0;
    coords.forEach(coord => {
      lngSum += coord[0];
      latSum += coord[1];
    });
    const center = {
      lat: latSum / coords.length,
      lng: lngSum / coords.length
    };
    console.log('  Center:', center);
    
    // Step 5: Submit imagery request
    console.log('\nStep 5: Submitting imagery request...');
    const requestPayload = {
      full_name: "Test User",
      email: "test@example.com",
      company: "Test Company",
      phone: "+1234567890",
      aoi_type: "polygon",
      aoi_coordinates: {
        type: geometry.type,
        coordinates: geometry.coordinates
      },
      aoi_area_km2: areaKm2,
      aoi_center: center,
      date_range: {
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      filters: {
        resolution_category: ["high"],
        max_cloud_coverage: 30,
        providers: ["Planet Labs"],
        bands: ["RGB", "NIR"],
        image_types: ["optical"]
      },
      urgency: "urgent",
      additional_requirements: "Test request from GeoJSON upload"
    };
    
    const requestResponse = await axios.post(
      `${API_URL}/api/public/imagery-requests`,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✓ Imagery request submitted successfully');
    console.log('  Request ID:', requestResponse.data.request_id);
    console.log('  Status:', requestResponse.data.request.status);
    
    return true;
  } catch (error) {
    console.error('✗ Full flow test failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    
    // Clean up temp file if it exists
    const tempGeoJSONPath = path.join(__dirname, 'temp-flow-test.geojson');
    if (fs.existsSync(tempGeoJSONPath)) {
      fs.unlinkSync(tempGeoJSONPath);
    }
    
    return false;
  }
}

async function runTests() {
  console.log('Testing Full Upload-to-Request Flow...');
  console.log('API URL:', API_URL);
  
  const results = {
    kml: await testFullFlowWithKML(),
    geojson: await testFullFlowWithGeoJSON()
  };
  
  console.log('\n=== Test Summary ===');
  console.log('KML Full Flow:', results.kml ? '✓ PASS' : '✗ FAIL');
  console.log('GeoJSON Full Flow:', results.geojson ? '✓ PASS' : '✗ FAIL');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  console.log(`\nTotal: ${passedTests}/${totalTests} tests passed`);
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

runTests();
