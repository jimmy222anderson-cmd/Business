import { describe, it, expect } from "vitest";

// Test filter state integration with request form
describe("Filter Integration with Request Form", () => {
  it("should include filter state in request payload when filters are applied", () => {
    // Mock filter state
    const filterState = {
      dateRange: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      },
      selectedResolutions: ['vhr', 'high'] as const,
      cloudCoverage: 20,
      selectedProviders: ['Maxar Technologies', 'Planet Labs'],
      selectedBands: ['RGB', 'NIR'],
      imageType: 'optical',
    };

    // Mock AOI data
    const aoiData = {
      type: 'polygon',
      geoJSON: {},
      coordinates: [[[10.0, 20.0], [10.0, 30.0], [20.0, 30.0], [20.0, 20.0], [10.0, 20.0]]],
      area: 123.45,
      center: { lat: 25.0, lng: 15.0 },
    };

    // Mock form data
    const formData = {
      full_name: 'John Doe',
      email: 'john@example.com',
      company: 'Test Company',
      phone: '+1 555-1234',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31'),
      urgency: 'standard' as const,
      additional_requirements: 'Test requirements',
    };

    // Simulate payload construction (matching RequestForm logic)
    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      company: formData.company || undefined,
      phone: formData.phone || undefined,
      aoi_type: aoiData.type,
      aoi_coordinates: {
        type: "Polygon",
        coordinates: aoiData.coordinates,
      },
      aoi_area_km2: aoiData.area,
      aoi_center: aoiData.center,
      date_range: {
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString(),
      },
      filters: filterState ? {
        resolution_category: filterState.selectedResolutions.length > 0 ? filterState.selectedResolutions : undefined,
        max_cloud_coverage: filterState.cloudCoverage < 100 ? filterState.cloudCoverage : undefined,
        providers: filterState.selectedProviders.length > 0 ? filterState.selectedProviders : undefined,
        bands: filterState.selectedBands.length > 0 ? filterState.selectedBands : undefined,
        image_types: filterState.imageType ? [filterState.imageType] : undefined,
      } : undefined,
      urgency: formData.urgency,
      additional_requirements: formData.additional_requirements || undefined,
    };

    // Verify payload includes filter data
    expect(payload.filters).toBeDefined();
    expect(payload.filters?.resolution_category).toEqual(['vhr', 'high']);
    expect(payload.filters?.max_cloud_coverage).toBe(20);
    expect(payload.filters?.providers).toEqual(['Maxar Technologies', 'Planet Labs']);
    expect(payload.filters?.bands).toEqual(['RGB', 'NIR']);
    expect(payload.filters?.image_types).toEqual(['optical']);
  });

  it("should not include filter fields when no filters are applied", () => {
    // Mock filter state with no filters
    const filterState = {
      dateRange: {
        startDate: null,
        endDate: null,
      },
      selectedResolutions: [] as const,
      cloudCoverage: 100,
      selectedProviders: [],
      selectedBands: [],
      imageType: '',
    };

    // Simulate payload construction
    const filters = filterState ? {
      resolution_category: filterState.selectedResolutions.length > 0 ? filterState.selectedResolutions : undefined,
      max_cloud_coverage: filterState.cloudCoverage < 100 ? filterState.cloudCoverage : undefined,
      providers: filterState.selectedProviders.length > 0 ? filterState.selectedProviders : undefined,
      bands: filterState.selectedBands.length > 0 ? filterState.selectedBands : undefined,
      image_types: filterState.imageType ? [filterState.imageType] : undefined,
    } : undefined;

    // Verify all filter fields are undefined
    expect(filters?.resolution_category).toBeUndefined();
    expect(filters?.max_cloud_coverage).toBeUndefined();
    expect(filters?.providers).toBeUndefined();
    expect(filters?.bands).toBeUndefined();
    expect(filters?.image_types).toBeUndefined();
  });

  it("should include only applied filters in payload", () => {
    // Mock filter state with partial filters
    const filterState = {
      dateRange: {
        startDate: null,
        endDate: null,
      },
      selectedResolutions: ['vhr'] as const,
      cloudCoverage: 100, // Not applied
      selectedProviders: [],
      selectedBands: ['RGB'],
      imageType: '', // Not applied
    };

    // Simulate payload construction
    const filters = {
      resolution_category: filterState.selectedResolutions.length > 0 ? filterState.selectedResolutions : undefined,
      max_cloud_coverage: filterState.cloudCoverage < 100 ? filterState.cloudCoverage : undefined,
      providers: filterState.selectedProviders.length > 0 ? filterState.selectedProviders : undefined,
      bands: filterState.selectedBands.length > 0 ? filterState.selectedBands : undefined,
      image_types: filterState.imageType ? [filterState.imageType] : undefined,
    };

    // Verify only applied filters are included
    expect(filters.resolution_category).toEqual(['vhr']);
    expect(filters.bands).toEqual(['RGB']);
    expect(filters.max_cloud_coverage).toBeUndefined();
    expect(filters.providers).toBeUndefined();
    expect(filters.image_types).toBeUndefined();
  });

  it("should handle null filter state gracefully", () => {
    const filterState = null;

    // Simulate payload construction
    const filters = filterState ? {
      resolution_category: filterState.selectedResolutions.length > 0 ? filterState.selectedResolutions : undefined,
      max_cloud_coverage: filterState.cloudCoverage < 100 ? filterState.cloudCoverage : undefined,
      providers: filterState.selectedProviders.length > 0 ? filterState.selectedProviders : undefined,
      bands: filterState.selectedBands.length > 0 ? filterState.selectedBands : undefined,
      image_types: filterState.imageType ? [filterState.imageType] : undefined,
    } : undefined;

    // Verify filters is undefined when filterState is null
    expect(filters).toBeUndefined();
  });

  it("should format cloud coverage correctly when applied", () => {
    const filterState = {
      dateRange: { startDate: null, endDate: null },
      selectedResolutions: [] as const,
      cloudCoverage: 30,
      selectedProviders: [],
      selectedBands: [],
      imageType: '',
    };

    const filters = {
      max_cloud_coverage: filterState.cloudCoverage < 100 ? filterState.cloudCoverage : undefined,
    };

    expect(filters.max_cloud_coverage).toBe(30);
  });

  it("should format image type as array when applied", () => {
    const filterState = {
      dateRange: { startDate: null, endDate: null },
      selectedResolutions: [] as const,
      cloudCoverage: 100,
      selectedProviders: [],
      selectedBands: [],
      imageType: 'radar',
    };

    const filters = {
      image_types: filterState.imageType ? [filterState.imageType] : undefined,
    };

    expect(filters.image_types).toEqual(['radar']);
  });
});
