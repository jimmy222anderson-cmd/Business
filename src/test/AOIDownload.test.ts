import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  geoJSONToKML, 
  exportAsGeoJSON, 
  exportAsKML,
  generateTimestamp 
} from '@/lib/utils/geospatial';

describe('AOI Download Utilities', () => {
  describe('geoJSONToKML', () => {
    it('converts Polygon geometry to KML format', () => {
      const geometry = {
        type: 'Polygon',
        coordinates: [
          [
            [-122.4, 37.8],
            [-122.4, 37.7],
            [-122.3, 37.7],
            [-122.3, 37.8],
            [-122.4, 37.8]
          ]
        ]
      };

      const kml = geoJSONToKML(geometry, 'Test AOI');

      expect(kml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(kml).toContain('<kml xmlns="http://www.opengis.net/kml/2.2">');
      expect(kml).toContain('<name>Test AOI</name>');
      expect(kml).toContain('<Polygon>');
      expect(kml).toContain('<outerBoundaryIs>');
      expect(kml).toContain('<coordinates>');
      expect(kml).toContain('-122.4,37.8,0');
      expect(kml).toContain('</Polygon>');
    });

    it('converts Point geometry to KML format', () => {
      const geometry = {
        type: 'Point',
        coordinates: [-122.4, 37.8]
      };

      const kml = geoJSONToKML(geometry, 'Test Point');

      expect(kml).toContain('<Point>');
      expect(kml).toContain('<coordinates>-122.4,37.8,0</coordinates>');
    });

    it('converts LineString geometry to KML format', () => {
      const geometry = {
        type: 'LineString',
        coordinates: [
          [-122.4, 37.8],
          [-122.3, 37.7]
        ]
      };

      const kml = geoJSONToKML(geometry, 'Test Line');

      expect(kml).toContain('<LineString>');
      expect(kml).toContain('-122.4,37.8,0');
      expect(kml).toContain('-122.3,37.7,0');
    });

    it('converts MultiPolygon geometry to KML format', () => {
      const geometry = {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-122.4, 37.8],
              [-122.4, 37.7],
              [-122.3, 37.7],
              [-122.3, 37.8],
              [-122.4, 37.8]
            ]
          ]
        ]
      };

      const kml = geoJSONToKML(geometry, 'Test MultiPolygon');

      expect(kml).toContain('<MultiGeometry>');
      expect(kml).toContain('<Polygon>');
      expect(kml).toContain('-122.4,37.8,0');
    });

    it('escapes XML special characters in name', () => {
      const geometry = {
        type: 'Point',
        coordinates: [-122.4, 37.8]
      };

      const kml = geoJSONToKML(geometry, 'Test & <AOI>');

      expect(kml).toContain('Test &amp; &lt;AOI&gt;');
    });

    it('throws error for unsupported geometry type', () => {
      const geometry = {
        type: 'UnsupportedType',
        coordinates: []
      };

      expect(() => geoJSONToKML(geometry)).toThrow('Unsupported geometry type');
    });
  });

  describe('generateTimestamp', () => {
    it('generates timestamp in correct format', () => {
      const timestamp = generateTimestamp();
      
      // Should match format: YYYY-MM-DDTHH-MM-SS
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
    });
  });

  describe('exportAsGeoJSON', () => {
    beforeEach(() => {
      // Mock DOM methods
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
    });

    it('creates GeoJSON FeatureCollection with correct structure', () => {
      const geometry = {
        type: 'Polygon',
        coordinates: [
          [
            [-122.4, 37.8],
            [-122.4, 37.7],
            [-122.3, 37.7],
            [-122.3, 37.8],
            [-122.4, 37.8]
          ]
        ]
      };

      // Mock Blob to capture content
      const mockBlob = vi.fn();
      global.Blob = mockBlob as any;

      exportAsGeoJSON(geometry);

      expect(mockBlob).toHaveBeenCalled();
      const blobContent = mockBlob.mock.calls[0][0][0];
      const parsed = JSON.parse(blobContent);

      expect(parsed.type).toBe('FeatureCollection');
      expect(parsed.features).toHaveLength(1);
      expect(parsed.features[0].type).toBe('Feature');
      expect(parsed.features[0].geometry).toEqual(geometry);
      expect(parsed.features[0].properties.name).toBe('Area of Interest');
      expect(parsed.features[0].properties.exported_at).toBeDefined();
    });

    it('uses custom filename when provided', () => {
      const geometry = {
        type: 'Point',
        coordinates: [-122.4, 37.8]
      };

      const createElementSpy = vi.spyOn(document, 'createElement');
      
      exportAsGeoJSON(geometry, 'custom-aoi.geojson');

      const linkElement = createElementSpy.mock.results.find(
        result => result.value.tagName === 'A'
      )?.value;

      expect(linkElement?.download).toBe('custom-aoi.geojson');
    });

    it('generates default filename with timestamp', () => {
      const geometry = {
        type: 'Point',
        coordinates: [-122.4, 37.8]
      };

      const createElementSpy = vi.spyOn(document, 'createElement');
      
      exportAsGeoJSON(geometry);

      const linkElement = createElementSpy.mock.results.find(
        result => result.value.tagName === 'A'
      )?.value;

      expect(linkElement?.download).toMatch(/^aoi-export-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.geojson$/);
    });
  });

  describe('exportAsKML', () => {
    beforeEach(() => {
      // Mock DOM methods
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
    });

    it('creates KML file with correct MIME type', () => {
      const geometry = {
        type: 'Polygon',
        coordinates: [
          [
            [-122.4, 37.8],
            [-122.4, 37.7],
            [-122.3, 37.7],
            [-122.3, 37.8],
            [-122.4, 37.8]
          ]
        ]
      };

      const mockBlob = vi.fn();
      global.Blob = mockBlob as any;

      exportAsKML(geometry);

      expect(mockBlob).toHaveBeenCalledWith(
        expect.any(Array),
        { type: 'application/vnd.google-earth.kml+xml' }
      );
    });

    it('uses custom filename when provided', () => {
      const geometry = {
        type: 'Point',
        coordinates: [-122.4, 37.8]
      };

      const createElementSpy = vi.spyOn(document, 'createElement');
      
      exportAsKML(geometry, 'custom-aoi.kml');

      const linkElement = createElementSpy.mock.results.find(
        result => result.value.tagName === 'A'
      )?.value;

      expect(linkElement?.download).toBe('custom-aoi.kml');
    });

    it('generates default filename with timestamp', () => {
      const geometry = {
        type: 'Point',
        coordinates: [-122.4, 37.8]
      };

      const createElementSpy = vi.spyOn(document, 'createElement');
      
      exportAsKML(geometry);

      const linkElement = createElementSpy.mock.results.find(
        result => result.value.tagName === 'A'
      )?.value;

      expect(linkElement?.download).toMatch(/^aoi-export-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.kml$/);
    });
  });
});
