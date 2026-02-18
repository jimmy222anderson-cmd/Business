/**
 * Test coordinate validation and area calculation
 */

const { calculateAreaFromCoordinates, validateGeoJSONCoordinates, calculatePolygonCenter } = require('../utils/geoUtils');

console.log('=== Testing Geo Utilities ===\n');

// Test 1: Valid polygon coordinates
console.log('Test 1: Valid Polygon Coordinates');
const validPolygon = {
  type: 'Polygon',
  coordinates: [[
    [-122.4194, 37.7749],
    [-122.4194, 37.8049],
    [-122.3894, 37.8049],
    [-122.3894, 37.7749],
    [-122.4194, 37.7749]
  ]]
};

try {
  const isValid = validateGeoJSONCoordinates(validPolygon);
  console.log('✓ Validation:', isValid ? 'PASS' : 'FAIL');
  
  const area = calculateAreaFromCoordinates(validPolygon.coordinates);
  console.log('✓ Area calculated:', area, 'km²');
  
  const center = calculatePolygonCenter(validPolygon.coordinates);
  console.log('✓ Center calculated:', center);
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 2: Invalid coordinates (out of range)
console.log('\nTest 2: Invalid Coordinates (Out of Range)');
const invalidPolygon = {
  type: 'Polygon',
  coordinates: [[
    [-200, 37.7749], // Invalid longitude
    [-122.4194, 37.8049],
    [-122.3894, 37.8049],
    [-122.3894, 37.7749],
    [-200, 37.7749]
  ]]
};

try {
  const isValid = validateGeoJSONCoordinates(invalidPolygon);
  console.log(isValid ? '✗ Should have failed validation' : '✓ Correctly rejected invalid coordinates');
} catch (error) {
  console.log('✓ Correctly rejected:', error.message);
}

// Test 3: Valid Point coordinates
console.log('\nTest 3: Valid Point Coordinates');
const validPoint = {
  type: 'Point',
  coordinates: [-122.4044, 37.7899]
};

try {
  const isValid = validateGeoJSONCoordinates(validPoint);
  console.log('✓ Validation:', isValid ? 'PASS' : 'FAIL');
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 4: Large polygon area calculation
console.log('\nTest 4: Large Polygon Area');
const largePolygon = {
  type: 'Polygon',
  coordinates: [[
    [-122.5, 37.7],
    [-122.5, 38.0],
    [-122.0, 38.0],
    [-122.0, 37.7],
    [-122.5, 37.7]
  ]]
};

try {
  const area = calculateAreaFromCoordinates(largePolygon.coordinates);
  console.log('✓ Large area calculated:', area, 'km²');
  
  const center = calculatePolygonCenter(largePolygon.coordinates);
  console.log('✓ Center:', center);
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 5: Small polygon area calculation
console.log('\nTest 5: Small Polygon Area');
const smallPolygon = {
  type: 'Polygon',
  coordinates: [[
    [-122.4194, 37.7749],
    [-122.4194, 37.7759],
    [-122.4184, 37.7759],
    [-122.4184, 37.7749],
    [-122.4194, 37.7749]
  ]]
};

try {
  const area = calculateAreaFromCoordinates(smallPolygon.coordinates);
  console.log('✓ Small area calculated:', area, 'km²');
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 6: Invalid polygon (too few points)
console.log('\nTest 6: Invalid Polygon (Too Few Points)');
try {
  const area = calculateAreaFromCoordinates([[
    [-122.4194, 37.7749],
    [-122.4194, 37.8049]
  ]]);
  console.error('✗ Should have thrown error for too few points');
} catch (error) {
  console.log('✓ Correctly rejected:', error.message);
}

console.log('\n=== All Geo Utility Tests Complete ===');
