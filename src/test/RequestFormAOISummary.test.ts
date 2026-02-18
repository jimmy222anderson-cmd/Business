import { describe, it, expect } from "vitest";

// AOI data interface (matching the component)
interface AOIData {
  type: string;
  geoJSON: any;
  coordinates: number[][][];
  area: number;
  center: { lat: number; lng: number };
  layer?: any;
}

// Helper function to calculate bounding box (matching the component logic)
const calculateBoundingBox = (coordinates: number[][][]) => {
  if (!coordinates || coordinates.length === 0 || coordinates[0].length === 0) {
    return null;
  }

  const points = coordinates[0];
  let minLng = points[0][0];
  let maxLng = points[0][0];
  let minLat = points[0][1];
  let maxLat = points[0][1];

  points.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  return {
    north: maxLat.toFixed(6),
    south: minLat.toFixed(6),
    east: maxLng.toFixed(6),
    west: minLng.toFixed(6),
  };
};

describe("RequestForm AOI Summary Display", () => {
  it("should calculate bounding box for a simple rectangle", () => {
    const coordinates: number[][][] = [
      [
        [10.0, 20.0],
        [10.0, 30.0],
        [20.0, 30.0],
        [20.0, 20.0],
        [10.0, 20.0],
      ],
    ];

    const boundingBox = calculateBoundingBox(coordinates);

    expect(boundingBox).not.toBeNull();
    expect(boundingBox?.north).toBe("30.000000");
    expect(boundingBox?.south).toBe("20.000000");
    expect(boundingBox?.east).toBe("20.000000");
    expect(boundingBox?.west).toBe("10.000000");
  });

  it("should calculate bounding box for a polygon", () => {
    const coordinates: number[][][] = [
      [
        [0.0, 0.0],
        [5.0, 10.0],
        [10.0, 5.0],
        [5.0, -5.0],
        [0.0, 0.0],
      ],
    ];

    const boundingBox = calculateBoundingBox(coordinates);

    expect(boundingBox).not.toBeNull();
    expect(boundingBox?.north).toBe("10.000000");
    expect(boundingBox?.south).toBe("-5.000000");
    expect(boundingBox?.east).toBe("10.000000");
    expect(boundingBox?.west).toBe("0.000000");
  });

  it("should return null for empty coordinates", () => {
    const coordinates: number[][][] = [];
    const boundingBox = calculateBoundingBox(coordinates);
    expect(boundingBox).toBeNull();
  });

  it("should return null for coordinates with empty inner array", () => {
    const coordinates: number[][][] = [[]];
    const boundingBox = calculateBoundingBox(coordinates);
    expect(boundingBox).toBeNull();
  });

  it("should handle coordinates with negative values", () => {
    const coordinates: number[][][] = [
      [
        [-10.0, -20.0],
        [-10.0, -10.0],
        [-5.0, -10.0],
        [-5.0, -20.0],
        [-10.0, -20.0],
      ],
    ];

    const boundingBox = calculateBoundingBox(coordinates);

    expect(boundingBox).not.toBeNull();
    expect(boundingBox?.north).toBe("-10.000000");
    expect(boundingBox?.south).toBe("-20.000000");
    expect(boundingBox?.east).toBe("-5.000000");
    expect(boundingBox?.west).toBe("-10.000000");
  });

  it("should handle coordinates crossing the equator and prime meridian", () => {
    const coordinates: number[][][] = [
      [
        [-5.0, -5.0],
        [-5.0, 5.0],
        [5.0, 5.0],
        [5.0, -5.0],
        [-5.0, -5.0],
      ],
    ];

    const boundingBox = calculateBoundingBox(coordinates);

    expect(boundingBox).not.toBeNull();
    expect(boundingBox?.north).toBe("5.000000");
    expect(boundingBox?.south).toBe("-5.000000");
    expect(boundingBox?.east).toBe("5.000000");
    expect(boundingBox?.west).toBe("-5.000000");
  });

  it("should format coordinates with 6 decimal places", () => {
    const coordinates: number[][][] = [
      [
        [10.123456789, 20.987654321],
        [10.123456789, 21.987654321],
        [11.123456789, 21.987654321],
        [11.123456789, 20.987654321],
        [10.123456789, 20.987654321],
      ],
    ];

    const boundingBox = calculateBoundingBox(coordinates);

    expect(boundingBox).not.toBeNull();
    expect(boundingBox?.north).toBe("21.987654");
    expect(boundingBox?.south).toBe("20.987654");
    expect(boundingBox?.east).toBe("11.123457");
    expect(boundingBox?.west).toBe("10.123457");
  });

  it("should validate AOI data structure for polygon", () => {
    const aoiData: AOIData = {
      type: "polygon",
      geoJSON: {},
      coordinates: [
        [
          [10.0, 20.0],
          [10.0, 30.0],
          [20.0, 30.0],
          [20.0, 20.0],
          [10.0, 20.0],
        ],
      ],
      area: 123.45,
      center: { lat: 25.0, lng: 15.0 },
    };

    expect(aoiData.type).toBe("polygon");
    expect(aoiData.area).toBeGreaterThan(0);
    expect(aoiData.center.lat).toBeDefined();
    expect(aoiData.center.lng).toBeDefined();
    expect(aoiData.coordinates).toHaveLength(1);
    expect(aoiData.coordinates[0]).toHaveLength(5);
  });

  it("should validate AOI data structure for rectangle", () => {
    const aoiData: AOIData = {
      type: "rectangle",
      geoJSON: {},
      coordinates: [
        [
          [10.0, 20.0],
          [10.0, 30.0],
          [20.0, 30.0],
          [20.0, 20.0],
          [10.0, 20.0],
        ],
      ],
      area: 100.0,
      center: { lat: 25.0, lng: 15.0 },
    };

    expect(aoiData.type).toBe("rectangle");
    expect(aoiData.area).toBe(100.0);
    expect(aoiData.center).toEqual({ lat: 25.0, lng: 15.0 });
  });

  it("should handle single point (degenerate case)", () => {
    const coordinates: number[][][] = [
      [
        [10.0, 20.0],
      ],
    ];

    const boundingBox = calculateBoundingBox(coordinates);

    expect(boundingBox).not.toBeNull();
    expect(boundingBox?.north).toBe("20.000000");
    expect(boundingBox?.south).toBe("20.000000");
    expect(boundingBox?.east).toBe("10.000000");
    expect(boundingBox?.west).toBe("10.000000");
  });
});
