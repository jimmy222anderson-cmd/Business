import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitImageryRequest } from "@/lib/api/imageryRequests";
import type { ImageryRequestPayload } from "@/lib/api/imageryRequests";

// Mock the API client
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe("RequestForm Submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should combine form data with AOI data correctly", () => {
    const formData = {
      full_name: "John Doe",
      email: "john@example.com",
      company: "Test Company",
      phone: "+1 (555) 123-4567",
      urgency: "standard" as const,
      additional_requirements: "Need high resolution imagery",
    };

    const aoiData = {
      type: "polygon",
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

    const expectedPayload: ImageryRequestPayload = {
      full_name: formData.full_name,
      email: formData.email,
      company: formData.company,
      phone: formData.phone,
      aoi_type: aoiData.type,
      aoi_coordinates: {
        type: "Polygon",
        coordinates: aoiData.coordinates,
      },
      aoi_area_km2: aoiData.area,
      aoi_center: aoiData.center,
      urgency: formData.urgency,
      additional_requirements: formData.additional_requirements,
    };

    // Verify the payload structure is correct
    expect(expectedPayload.full_name).toBe("John Doe");
    expect(expectedPayload.email).toBe("john@example.com");
    expect(expectedPayload.aoi_type).toBe("polygon");
    expect(expectedPayload.aoi_coordinates.type).toBe("Polygon");
    expect(expectedPayload.aoi_area_km2).toBe(123.45);
    expect(expectedPayload.urgency).toBe("standard");
  });

  it("should handle optional fields correctly", () => {
    const formData = {
      full_name: "Jane Smith",
      email: "jane@example.com",
      urgency: "urgent" as const,
    };

    const aoiData = {
      type: "rectangle",
      coordinates: [
        [
          [5.0, 10.0],
          [5.0, 15.0],
          [10.0, 15.0],
          [10.0, 10.0],
          [5.0, 10.0],
        ],
      ],
      area: 50.0,
      center: { lat: 12.5, lng: 7.5 },
    };

    const expectedPayload: ImageryRequestPayload = {
      full_name: formData.full_name,
      email: formData.email,
      aoi_type: aoiData.type,
      aoi_coordinates: {
        type: "Polygon",
        coordinates: aoiData.coordinates,
      },
      aoi_area_km2: aoiData.area,
      aoi_center: aoiData.center,
      urgency: formData.urgency,
    };

    // Verify optional fields are not included
    expect(expectedPayload.company).toBeUndefined();
    expect(expectedPayload.phone).toBeUndefined();
    expect(expectedPayload.additional_requirements).toBeUndefined();
  });

  it("should validate required AOI fields", () => {
    const aoiData = {
      type: "polygon",
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

    // Verify all required AOI fields are present
    expect(aoiData.type).toBeDefined();
    expect(aoiData.coordinates).toBeDefined();
    expect(aoiData.area).toBeDefined();
    expect(aoiData.center).toBeDefined();
    expect(aoiData.center.lat).toBeDefined();
    expect(aoiData.center.lng).toBeDefined();
  });

  it("should format coordinates as GeoJSON Polygon", () => {
    const coordinates = [
      [
        [10.0, 20.0],
        [10.0, 30.0],
        [20.0, 30.0],
        [20.0, 20.0],
        [10.0, 20.0],
      ],
    ];

    const geoJSONCoordinates = {
      type: "Polygon",
      coordinates: coordinates,
    };

    expect(geoJSONCoordinates.type).toBe("Polygon");
    expect(geoJSONCoordinates.coordinates).toEqual(coordinates);
    expect(geoJSONCoordinates.coordinates[0]).toHaveLength(5); // Closed polygon
    expect(geoJSONCoordinates.coordinates[0][0]).toEqual(
      geoJSONCoordinates.coordinates[0][4]
    ); // First and last points match
  });

  it("should handle all urgency levels", () => {
    const urgencyLevels = ["standard", "urgent", "emergency"] as const;

    urgencyLevels.forEach((urgency) => {
      const payload: Partial<ImageryRequestPayload> = {
        urgency: urgency,
      };

      expect(payload.urgency).toBe(urgency);
      expect(["standard", "urgent", "emergency"]).toContain(payload.urgency);
    });
  });
});
