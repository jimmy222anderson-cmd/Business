/**
 * Geospatial utility functions for calculating areas and distances
 */

/**
 * Calculate the area of a polygon using the Shoelace formula
 * Coordinates should be in GeoJSON format: [[[lng, lat], [lng, lat], ...]]
 * Returns area in square kilometers
 * 
 * @param {Array} coordinates - GeoJSON polygon coordinates
 * @returns {number} Area in square kilometers
 */
function calculateAreaFromCoordinates(coordinates) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error('Invalid coordinates format');
  }

  // Get the outer ring (first array in coordinates)
  const ring = coordinates[0];
  
  if (!Array.isArray(ring) || ring.length < 3) {
    throw new Error('Polygon must have at least 3 points');
  }

  // Calculate area using Shoelace formula with spherical approximation
  // For more accurate results, we use the Haversine-based approach
  let area = 0;
  const earthRadius = 6371; // Earth's radius in kilometers

  for (let i = 0; i < ring.length - 1; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];

    // Convert to radians
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lngDiff = ((lng2 - lng1) * Math.PI) / 180;

    // Spherical excess formula
    area += lngDiff * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  area = Math.abs(area * earthRadius * earthRadius / 2);

  return parseFloat(area.toFixed(2));
}

/**
 * Validate GeoJSON coordinates
 * 
 * @param {Object} geoJson - GeoJSON object with type and coordinates
 * @returns {boolean} True if valid
 */
function validateGeoJSONCoordinates(geoJson) {
  if (!geoJson || typeof geoJson !== 'object') {
    return false;
  }

  const { type, coordinates } = geoJson;

  if (!type || !coordinates) {
    return false;
  }

  // Validate Polygon
  if (type === 'Polygon') {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return false;
    }

    const ring = coordinates[0];
    if (!Array.isArray(ring) || ring.length < 4) {
      return false; // Polygon must have at least 4 points (first and last are same)
    }

    // Check if all coordinates are valid [lng, lat] pairs
    return ring.every(coord => 
      Array.isArray(coord) && 
      coord.length === 2 && 
      typeof coord[0] === 'number' && 
      typeof coord[1] === 'number' &&
      coord[0] >= -180 && coord[0] <= 180 && // Valid longitude
      coord[1] >= -90 && coord[1] <= 90 // Valid latitude
    );
  }

  // Validate Point (for circle center)
  if (type === 'Point') {
    return Array.isArray(coordinates) &&
           coordinates.length === 2 &&
           typeof coordinates[0] === 'number' &&
           typeof coordinates[1] === 'number' &&
           coordinates[0] >= -180 && coordinates[0] <= 180 &&
           coordinates[1] >= -90 && coordinates[1] <= 90;
  }

  return false;
}

/**
 * Calculate the center point of a polygon
 * 
 * @param {Array} coordinates - GeoJSON polygon coordinates
 * @returns {Object} Center point { lat, lng }
 */
function calculatePolygonCenter(coordinates) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error('Invalid coordinates format');
  }

  const ring = coordinates[0];
  
  if (!Array.isArray(ring) || ring.length < 3) {
    throw new Error('Polygon must have at least 3 points');
  }

  let sumLat = 0;
  let sumLng = 0;
  const count = ring.length - 1; // Exclude the last point (same as first)

  for (let i = 0; i < count; i++) {
    sumLng += ring[i][0];
    sumLat += ring[i][1];
  }

  return {
    lat: parseFloat((sumLat / count).toFixed(6)),
    lng: parseFloat((sumLng / count).toFixed(6))
  };
}

module.exports = {
  calculateAreaFromCoordinates,
  validateGeoJSONCoordinates,
  calculatePolygonCenter
};
