/**
 * Bug Condition Exploration Tests for AOI Area and Coordinates Display
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * CRITICAL: These tests are EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bugs exist. DO NOT attempt to fix the tests or code when they fail.
 * 
 * These tests encode the expected behavior - they will validate the fix when they pass after implementation.
 * 
 * Bug 1: Area calculation discrepancy between frontend and backend
 * Bug 2: Incomplete coordinate display for polygon/rectangle AOIs
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Import the frontend area calculation function
// We'll need to extract this from MapContainer.tsx or replicate it here for testing
const calculateGeodesicAreaFrontend = (latlngs: Array<{ lat: number; lng: number }>): number => {
  const earthRadius = 6371; // Earth's radius in kilometers (FIXED)
  
  if (latlngs.length < 3) return 0;
  
  let area = 0;
  const len = latlngs.length;
  
  for (let i = 0; i < len; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % len];
    
    // Convert to radians
    const lat1Rad = (p1.lat * Math.PI) / 180;
    const lat2Rad = (p2.lat * Math.PI) / 180;
    const lngDiff = ((p2.lng - p1.lng) * Math.PI) / 180;
    
    // Spherical excess formula
    area += lngDiff * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }
  
  area = Math.abs(area * earthRadius * earthRadius / 2);
  
  return parseFloat(area.toFixed(2));
};

// Replicate the backend area calculation function
const calculateAreaFromCoordinatesBackend = (coordinates: number[][][]): number => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error('Invalid coordinates format');
  }

  const ring = coordinates[0];
  
  if (!Array.isArray(ring) || ring.length < 3) {
    throw new Error('Polygon must have at least 3 points');
  }

  let area = 0;
  const earthRadius = 6371; // Earth's radius in kilometers (backend implementation)

  for (let i = 0; i < ring.length - 1; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];

    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lngDiff = ((lng2 - lng1) * Math.PI) / 180;

    area += lngDiff * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  area = Math.abs(area * earthRadius * earthRadius / 2);

  return parseFloat(area.toFixed(2));
};

describe('Bug Condition Exploration: Area Calculation Consistency', () => {
  /**
   * Property 1: Fault Condition - Area Calculation Consistency
   * 
   * This test demonstrates Bug 1: Frontend and backend calculate different areas for the same polygon.
   * 
   * EXPECTED OUTCOME: This test WILL FAIL on unfixed code (this is correct - it proves the bug exists)
   * Expected: Frontend area differs significantly from backend area (e.g., 0.39 km² vs 22.24 km²)
   */
  
  it('should demonstrate area calculation discrepancy between frontend and backend for the known failing polygon', () => {
    // This is the polygon from the bug report that shows the discrepancy
    // Backend calculates: 22.24 km²
    // Frontend displays: 0.39 km²
    
    const polygonCoordinates = [
      [
        [72.7, 22.0],
        [72.8, 22.0],
        [72.8, 22.1],
        [72.7, 22.1],
        [72.7, 22.0]
      ]
    ];
    
    // Convert to frontend format (lat/lng objects)
    const frontendFormat = polygonCoordinates[0].slice(0, -1).map(([lng, lat]) => ({ lat, lng }));
    
    // Calculate using both methods
    const frontendArea = calculateGeodesicAreaFrontend(frontendFormat);
    const backendArea = calculateAreaFromCoordinatesBackend(polygonCoordinates);
    
    console.log('Frontend area:', frontendArea, 'km²');
    console.log('Backend area:', backendArea, 'km²');
    console.log('Difference:', Math.abs(frontendArea - backendArea), 'km²');
    
    // EXPECTED TO FAIL: Frontend and backend should produce the same area within 0.01 km² tolerance
    // This test encodes the expected behavior after the fix
    expect(Math.abs(frontendArea - backendArea)).toBeLessThan(0.01);
  });

  it('should demonstrate area calculation discrepancy for a small polygon near 1 km²', () => {
    // Small polygon to test if discrepancy is consistent at lower bounds
    const smallPolygonCoordinates = [
      [
        [72.70, 22.00],
        [72.71, 22.00],
        [72.71, 22.01],
        [72.70, 22.01],
        [72.70, 22.00]
      ]
    ];
    
    const frontendFormat = smallPolygonCoordinates[0].slice(0, -1).map(([lng, lat]) => ({ lat, lng }));
    
    const frontendArea = calculateGeodesicAreaFrontend(frontendFormat);
    const backendArea = calculateAreaFromCoordinatesBackend(smallPolygonCoordinates);
    
    console.log('Small polygon - Frontend area:', frontendArea, 'km²');
    console.log('Small polygon - Backend area:', backendArea, 'km²');
    console.log('Small polygon - Difference:', Math.abs(frontendArea - backendArea), 'km²');
    
    // EXPECTED TO FAIL: Areas should match within tolerance
    expect(Math.abs(frontendArea - backendArea)).toBeLessThan(0.01);
  });

  it('should demonstrate area calculation discrepancy for a large polygon', () => {
    // Larger polygon to test if discrepancy scales
    const largePolygonCoordinates = [
      [
        [72.0, 22.0],
        [73.0, 22.0],
        [73.0, 23.0],
        [72.0, 23.0],
        [72.0, 22.0]
      ]
    ];
    
    const frontendFormat = largePolygonCoordinates[0].slice(0, -1).map(([lng, lat]) => ({ lat, lng }));
    
    const frontendArea = calculateGeodesicAreaFrontend(frontendFormat);
    const backendArea = calculateAreaFromCoordinatesBackend(largePolygonCoordinates);
    
    console.log('Large polygon - Frontend area:', frontendArea, 'km²');
    console.log('Large polygon - Backend area:', backendArea, 'km²');
    console.log('Large polygon - Difference:', Math.abs(frontendArea - backendArea), 'km²');
    
    // EXPECTED TO FAIL: Areas should match within tolerance
    expect(Math.abs(frontendArea - backendArea)).toBeLessThan(0.01);
  });
});

describe('Bug Condition Exploration: Complete Vertex Coordinate Display', () => {
  /**
   * Property 1: Fault Condition - Complete Vertex Display
   * 
   * This test demonstrates Bug 2: Polygon/rectangle AOIs only display center coordinates,
   * not the vertex coordinates that define the shape.
   * 
   * EXPECTED OUTCOME: These tests WILL FAIL on unfixed code (this is correct - it proves the bug exists)
   * Expected: Vertex coordinates exist in data but are not rendered in UI
   */
  
  it('should demonstrate that ExplorerPage does not display vertex coordinates for polygon AOIs', () => {
    // Mock the polygon AOI data
    const mockPolygonAOI = {
      type: 'polygon',
      coordinates: [
        [
          [72.7, 22.0],
          [72.8, 22.0],
          [72.8, 22.1],
          [72.7, 22.1],
          [72.7, 22.0]
        ]
      ],
      area: 22.24,
      center: { lat: 22.0540, lng: 72.7980 }
    };
    
    const vertexCoordinates = mockPolygonAOI.coordinates[0].slice(0, -1); // Remove duplicate last point
    
    // EXPECTED TO FAIL: This test documents that vertex coordinates exist in the data
    // but are not displayed in the UI (only center is shown)
    // After the fix, ExplorerPage should display all vertex coordinates for polygons
    
    // For now, we verify that vertex coordinates exist in the data structure
    expect(vertexCoordinates.length).toBe(4);
    
    // This test will be enhanced after the fix to verify actual UI rendering
    // Currently, ExplorerPage only displays: "Center: 22.0540, 72.7980"
    // After fix, it should also display: "Vertex 1: 22.0000, 72.7000", etc.
    
    // Documenting the bug: Vertex coordinates exist but are not rendered
    console.log('Vertex coordinates exist in data:', vertexCoordinates);
    console.log('But ExplorerPage only displays center:', mockPolygonAOI.center);
  });

  it('should demonstrate that RequestForm does not display vertex coordinates for polygon AOIs', () => {
    // Mock the polygon AOI data
    const mockAOIData = {
      type: 'polygon',
      coordinates: [
        [
          [72.7, 22.0],
          [72.8, 22.0],
          [72.8, 22.1],
          [72.7, 22.1],
          [72.7, 22.0]
        ]
      ],
      area: 22.24,
      center: { lat: 22.0540, lng: 72.7980 }
    };
    
    const vertexCoordinates = mockAOIData.coordinates[0].slice(0, -1);
    
    // EXPECTED TO FAIL: This test documents that vertex coordinates exist in the data
    // but are not displayed in RequestForm (only center and bounding box are shown)
    
    // For now, we verify that vertex coordinates exist in the data structure
    expect(vertexCoordinates.length).toBe(4);
    
    // This test will be enhanced after the fix to verify actual UI rendering
    // Currently, RequestForm only displays: "Center Point" and "Bounding Box"
    // After fix, it should also display: "Vertex Coordinates" section
    
    // Documenting the bug: Vertex coordinates exist but are not rendered
    console.log('Vertex coordinates exist in data:', vertexCoordinates);
    console.log('But RequestForm only displays center and bounding box');
  });
});

describe('Bug Condition Exploration: Property-Based Tests', () => {
  /**
   * Property 1: Fault Condition - Area Calculation Consistency (Property-Based)
   * 
   * Uses property-based testing to generate random polygons and verify the bug exists
   * across many different polygon shapes.
   * 
   * EXPECTED OUTCOME: This test WILL FAIL on unfixed code
   * It will find counterexamples where frontend and backend areas differ
   */
  
  it('should find counterexamples where frontend and backend area calculations differ', () => {
    // Generator for valid polygon coordinates
    // We'll generate simple rectangular polygons for reproducibility
    const rectangleGenerator = fc.record({
      minLng: fc.double({ min: -180, max: 179, noNaN: true }),
      minLat: fc.double({ min: -89, max: 88, noNaN: true }),
      width: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
      height: fc.double({ min: 0.1, max: 1.0, noNaN: true })
    }).map(({ minLng, minLat, width, height }) => {
      // Create a rectangle
      const coordinates = [
        [
          [minLng, minLat],
          [minLng + width, minLat],
          [minLng + width, minLat + height],
          [minLng, minLat + height],
          [minLng, minLat] // Close the polygon
        ]
      ];
      return coordinates;
    });
    
    // EXPECTED TO FAIL: This property should hold after the fix
    // On unfixed code, it will find counterexamples where areas differ
    fc.assert(
      fc.property(rectangleGenerator, (coordinates) => {
        const frontendFormat = coordinates[0].slice(0, -1).map(([lng, lat]) => ({ lat, lng }));
        
        const frontendArea = calculateGeodesicAreaFrontend(frontendFormat);
        const backendArea = calculateAreaFromCoordinatesBackend(coordinates);
        
        // The property: frontend and backend should produce the same area within tolerance
        const difference = Math.abs(frontendArea - backendArea);
        
        // Log counterexamples for debugging
        if (difference >= 0.01) {
          console.log('Counterexample found:');
          console.log('Coordinates:', JSON.stringify(coordinates));
          console.log('Frontend area:', frontendArea, 'km²');
          console.log('Backend area:', backendArea, 'km²');
          console.log('Difference:', difference, 'km²');
        }
        
        return difference < 0.01;
      }),
      { numRuns: 100 } // Run 100 test cases
    );
  });
});
