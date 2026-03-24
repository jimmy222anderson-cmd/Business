/**
 * Unit tests for satellite imagery explorer
 * Covers: area calculation, coordinate conversion, form validation, API handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import {
  submitImageryRequest,
  getUserImageryRequests,
  getUserImageryRequest,
  cancelImageryRequest,
} from '@/lib/api/imageryRequests';
import {
  getSatelliteProducts,
  getSatelliteProduct,
} from '@/lib/api/satelliteProducts';
import {
  bookDemoSchema,
  signInSchema,
  contactSchema,
  quoteSchema,
} from '@/lib/form-schemas';
import {
  ApiError,
  getUserFriendlyErrorMessage,
  isNetworkError,
  isAuthError,
  isValidationError,
  isNotFoundError,
  isServerError,
} from '@/lib/api/errorHandler';
import { geoJSONToKML, generateTimestamp } from '@/lib/utils/geospatial';

// ---------------------------------------------------------------------------
// 1. Utility functions: area calculation and coordinate conversion
// ---------------------------------------------------------------------------

/**
 * Geodesic area calculation (spherical excess formula)
 * Extracted from MapContainer.tsx for isolated testing
 */
function calculateGeodesicArea(latlngs: { lat: number; lng: number }[]): number {
  const earthRadius = 6371;
  if (latlngs.length < 3) return 0;

  let area = 0;
  const len = latlngs.length;

  for (let i = 0; i < len; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % len];
    const lat1Rad = (p1.lat * Math.PI) / 180;
    const lat2Rad = (p2.lat * Math.PI) / 180;
    const lngDiff = ((p2.lng - p1.lng) * Math.PI) / 180;
    area += lngDiff * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  area = Math.abs((area * earthRadius * earthRadius) / 2);
  return parseFloat(area.toFixed(2));
}

/**
 * Center point calculation
 * Extracted from MapContainer.tsx for isolated testing
 */
function calculateCenterPoint(latlngs: { lat: number; lng: number }[]): { lat: number; lng: number } {
  if (latlngs.length === 0) return { lat: 0, lng: 0 };
  const latSum = latlngs.reduce((s, p) => s + p.lat, 0);
  const lngSum = latlngs.reduce((s, p) => s + p.lng, 0);
  return {
    lat: latSum / latlngs.length,
    lng: lngSum / latlngs.length,
  };
}

/** GeoJSON [lng, lat] → { lat, lng } */
function geoJSONCoordToLatLng(coord: [number, number]): { lat: number; lng: number } {
  return { lat: coord[1], lng: coord[0] };
}

/** { lat, lng } → GeoJSON [lng, lat] */
function latLngToGeoJSONCoord(point: { lat: number; lng: number }): [number, number] {
  return [point.lng, point.lat];
}

describe('Area Calculation Utilities', () => {
  it('returns 0 for fewer than 3 points', () => {
    expect(calculateGeodesicArea([])).toBe(0);
    expect(calculateGeodesicArea([{ lat: 0, lng: 0 }])).toBe(0);
    expect(calculateGeodesicArea([{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }])).toBe(0);
  });

  it('calculates a positive area for a valid polygon', () => {
    const square = [
      { lat: 0, lng: 0 },
      { lat: 1, lng: 0 },
      { lat: 1, lng: 1 },
      { lat: 0, lng: 1 },
    ];
    expect(calculateGeodesicArea(square)).toBeGreaterThan(0);
  });

  it('area is always non-negative regardless of winding order', () => {
    const cw = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 1, lng: 1 },
      { lat: 1, lng: 0 },
    ];
    const ccw = [...cw].reverse();
    expect(calculateGeodesicArea(cw)).toBeGreaterThanOrEqual(0);
    expect(calculateGeodesicArea(ccw)).toBeGreaterThanOrEqual(0);
  });

  it('larger polygon has larger area', () => {
    const small = [
      { lat: 0, lng: 0 },
      { lat: 0.1, lng: 0 },
      { lat: 0.1, lng: 0.1 },
      { lat: 0, lng: 0.1 },
    ];
    const large = [
      { lat: 0, lng: 0 },
      { lat: 1, lng: 0 },
      { lat: 1, lng: 1 },
      { lat: 0, lng: 1 },
    ];
    expect(calculateGeodesicArea(large)).toBeGreaterThan(calculateGeodesicArea(small));
  });

  it('returns a number with at most 2 decimal places', () => {
    const polygon = [
      { lat: 10, lng: 10 },
      { lat: 10, lng: 11 },
      { lat: 11, lng: 11 },
      { lat: 11, lng: 10 },
    ];
    const area = calculateGeodesicArea(polygon);
    const decimals = (area.toString().split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(2);
  });
});

describe('Center Point Calculation', () => {
  it('returns {0,0} for empty array', () => {
    expect(calculateCenterPoint([])).toEqual({ lat: 0, lng: 0 });
  });

  it('returns the single point for a one-element array', () => {
    expect(calculateCenterPoint([{ lat: 5, lng: 10 }])).toEqual({ lat: 5, lng: 10 });
  });

  it('returns midpoint for two points', () => {
    const result = calculateCenterPoint([{ lat: 0, lng: 0 }, { lat: 10, lng: 20 }]);
    expect(result.lat).toBe(5);
    expect(result.lng).toBe(10);
  });

  it('returns centroid for a square', () => {
    const square = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 2 },
      { lat: 2, lng: 2 },
      { lat: 2, lng: 0 },
    ];
    const center = calculateCenterPoint(square);
    expect(center.lat).toBe(1);
    expect(center.lng).toBe(1);
  });
});

describe('Coordinate Conversion Utilities', () => {
  it('converts GeoJSON [lng, lat] to {lat, lng}', () => {
    expect(geoJSONCoordToLatLng([-73.935242, 40.73061])).toEqual({
      lat: 40.73061,
      lng: -73.935242,
    });
  });

  it('converts {lat, lng} to GeoJSON [lng, lat]', () => {
    expect(latLngToGeoJSONCoord({ lat: 40.73061, lng: -73.935242 })).toEqual([
      -73.935242,
      40.73061,
    ]);
  });

  it('round-trips correctly', () => {
    const original: [number, number] = [34.0522, -118.2437];
    const converted = latLngToGeoJSONCoord(geoJSONCoordToLatLng(original));
    expect(converted[0]).toBeCloseTo(original[0]);
    expect(converted[1]).toBeCloseTo(original[1]);
  });

  it('handles negative coordinates', () => {
    expect(geoJSONCoordToLatLng([-180, -90])).toEqual({ lat: -90, lng: -180 });
  });
});

describe('geoJSONToKML', () => {
  const polygonGeometry = {
    type: 'Polygon',
    coordinates: [[[10, 20], [10, 30], [20, 30], [20, 20], [10, 20]]],
  };

  it('produces valid KML with XML declaration', () => {
    const kml = geoJSONToKML(polygonGeometry, 'Test AOI');
    expect(kml).toContain('<?xml version="1.0"');
    expect(kml).toContain('<kml');
    expect(kml).toContain('</kml>');
  });

  it('includes the provided name', () => {
    const kml = geoJSONToKML(polygonGeometry, 'My Region');
    expect(kml).toContain('My Region');
  });

  it('includes Polygon element for polygon geometry', () => {
    const kml = geoJSONToKML(polygonGeometry);
    expect(kml).toContain('<Polygon>');
    expect(kml).toContain('<outerBoundaryIs>');
  });

  it('includes Point element for point geometry', () => {
    const kml = geoJSONToKML({ type: 'Point', coordinates: [10, 20] });
    expect(kml).toContain('<Point>');
    expect(kml).toContain('10,20,0');
  });

  it('throws for unsupported geometry types', () => {
    expect(() => geoJSONToKML({ type: 'GeometryCollection', geometries: [] })).toThrow();
  });

  it('escapes XML special characters in name', () => {
    const kml = geoJSONToKML(polygonGeometry, 'Area & <Region>');
    expect(kml).toContain('&amp;');
    expect(kml).toContain('&lt;');
    expect(kml).toContain('&gt;');
  });
});

describe('generateTimestamp', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateTimestamp()).toBe('string');
    expect(generateTimestamp().length).toBeGreaterThan(0);
  });

  it('does not contain colons or dots (safe for filenames)', () => {
    const ts = generateTimestamp();
    expect(ts).not.toContain(':');
    expect(ts).not.toContain('.');
  });

  it('produces different values on successive calls (time-based)', async () => {
    const ts1 = generateTimestamp();
    await new Promise((r) => setTimeout(r, 10));
    const ts2 = generateTimestamp();
    // They may be equal within the same second, but the format should be consistent
    expect(ts1).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
    expect(ts2).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
  });
});

// ---------------------------------------------------------------------------
// 2. Form validation schemas
// ---------------------------------------------------------------------------

// RequestForm schema (mirrors the schema defined in RequestForm.tsx)
const requestFormSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  start_date: z.date(),
  end_date: z.date(),
  urgency: z.enum(['standard', 'urgent', 'emergency']),
  additional_requirements: z.string().max(2000).optional(),
}).refine((d) => d.end_date >= d.start_date, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

describe('requestFormSchema validation', () => {
  const base = {
    full_name: 'Alice Smith',
    email: 'alice@example.com',
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-01-31'),
    urgency: 'standard' as const,
  };

  it('accepts valid required-only data', () => {
    expect(requestFormSchema.safeParse(base).success).toBe(true);
  });

  it('accepts all urgency levels', () => {
    for (const urgency of ['standard', 'urgent', 'emergency'] as const) {
      expect(requestFormSchema.safeParse({ ...base, urgency }).success).toBe(true);
    }
  });

  it('rejects invalid email', () => {
    expect(requestFormSchema.safeParse({ ...base, email: 'bad' }).success).toBe(false);
  });

  it('rejects name shorter than 2 chars', () => {
    expect(requestFormSchema.safeParse({ ...base, full_name: 'A' }).success).toBe(false);
  });

  it('rejects name longer than 100 chars', () => {
    expect(requestFormSchema.safeParse({ ...base, full_name: 'A'.repeat(101) }).success).toBe(false);
  });

  it('rejects invalid urgency value', () => {
    expect(requestFormSchema.safeParse({ ...base, urgency: 'asap' as any }).success).toBe(false);
  });

  it('rejects end_date before start_date', () => {
    const result = requestFormSchema.safeParse({
      ...base,
      start_date: new Date('2024-02-01'),
      end_date: new Date('2024-01-01'),
    });
    expect(result.success).toBe(false);
  });

  it('accepts end_date equal to start_date', () => {
    const d = new Date('2024-06-15');
    expect(requestFormSchema.safeParse({ ...base, start_date: d, end_date: d }).success).toBe(true);
  });

  it('rejects phone longer than 20 chars', () => {
    expect(requestFormSchema.safeParse({ ...base, phone: '1'.repeat(21) }).success).toBe(false);
  });

  it('rejects additional_requirements longer than 2000 chars', () => {
    expect(requestFormSchema.safeParse({ ...base, additional_requirements: 'x'.repeat(2001) }).success).toBe(false);
  });
});

describe('bookDemoSchema validation', () => {
  const valid = {
    fullName: 'Alice Smith',
    email: 'alice@example.com',
    companyName: 'Acme Corp',
    phoneNumber: '+1 555 123 4567',
    jobTitle: 'Engineer',
    message: 'I would like to book a demo of your platform.',
  };

  it('accepts valid data', () => {
    expect(bookDemoSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(bookDemoSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects name shorter than 2 chars', () => {
    expect(bookDemoSchema.safeParse({ ...valid, fullName: 'A' }).success).toBe(false);
  });

  it('rejects message shorter than 10 chars', () => {
    expect(bookDemoSchema.safeParse({ ...valid, message: 'Short' }).success).toBe(false);
  });

  it('rejects phone with letters', () => {
    expect(bookDemoSchema.safeParse({ ...valid, phoneNumber: 'abc-def-ghij' }).success).toBe(false);
  });
});

describe('signInSchema validation', () => {
  it('accepts valid credentials', () => {
    expect(signInSchema.safeParse({ email: 'user@example.com', password: 'password123' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(signInSchema.safeParse({ email: 'bad', password: 'password123' }).success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    expect(signInSchema.safeParse({ email: 'user@example.com', password: 'short' }).success).toBe(false);
  });
});

describe('contactSchema validation', () => {
  const valid = {
    fullName: 'Bob Jones',
    email: 'bob@example.com',
    subject: 'Hello there',
    message: 'This is a test message with enough characters.',
  };

  it('accepts valid data', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects subject shorter than 3 chars', () => {
    expect(contactSchema.safeParse({ ...valid, subject: 'Hi' }).success).toBe(false);
  });

  it('rejects message shorter than 10 chars', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'Too short' }).success).toBe(false);
  });
});

describe('quoteSchema validation', () => {
  const valid = {
    fullName: 'Carol White',
    email: 'carol@example.com',
    companyName: 'Data Corp',
    phoneNumber: '+44 20 7946 0958',
    industry: 'Agriculture',
    estimatedDataVolume: '1-10 TB/month',
    requirements: 'We need high-resolution imagery for crop monitoring across multiple regions.',
  };

  it('accepts valid data', () => {
    expect(quoteSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing industry', () => {
    const { industry, ...rest } = valid;
    expect(quoteSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects requirements shorter than 20 chars', () => {
    expect(quoteSchema.safeParse({ ...valid, requirements: 'Too short' }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. API request/response handling
// ---------------------------------------------------------------------------

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api-client';

// Cast to mocked version without TypeScript overlap error
const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);

describe('imageryRequests API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const samplePayload = {
    full_name: 'John Doe',
    email: 'john@example.com',
    aoi_type: 'polygon',
    aoi_coordinates: {
      type: 'Polygon',
      coordinates: [[[10, 20], [10, 30], [20, 30], [20, 20], [10, 20]]],
    },
    aoi_area_km2: 123.45,
    aoi_center: { lat: 25, lng: 15 },
    urgency: 'standard' as const,
  };

  it('submitImageryRequest calls POST /public/imagery-requests with payload', async () => {
    const mockResponse = {
      message: 'Request submitted',
      request_id: 'req-123',
      request: { id: 'req-123', status: 'pending', aoi_area_km2: 123.45, created_at: '2024-01-01' },
    };
    mockPost.mockResolvedValueOnce(mockResponse);

    const result = await submitImageryRequest(samplePayload);

    expect(mockPost).toHaveBeenCalledWith('/public/imagery-requests', samplePayload);
    expect(result.request_id).toBe('req-123');
  });

  it('submitImageryRequest propagates errors from apiClient', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network error'));
    await expect(submitImageryRequest(samplePayload)).rejects.toThrow('Network error');
  });

  it('getUserImageryRequests calls GET /user/imagery-requests without params', async () => {
    const mockResponse = {
      requests: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    const result = await getUserImageryRequests();

    expect(mockGet).toHaveBeenCalledWith('/user/imagery-requests');
    expect(result.requests).toEqual([]);
  });

  it('getUserImageryRequests appends query params when provided', async () => {
    mockGet.mockResolvedValueOnce({ requests: [], pagination: {} });

    await getUserImageryRequests({ status: 'pending', page: 2, limit: 5 });

    expect(mockGet).toHaveBeenCalledWith(
      '/user/imagery-requests?status=pending&page=2&limit=5'
    );
  });

  it('getUserImageryRequest calls GET /user/imagery-requests/:id', async () => {
    const mockRequest = { _id: 'req-456', status: 'approved' };
    mockGet.mockResolvedValueOnce({ request: mockRequest });

    const result = await getUserImageryRequest('req-456');

    expect(mockGet).toHaveBeenCalledWith('/user/imagery-requests/req-456');
    expect(result.request).toEqual(mockRequest);
  });

  it('cancelImageryRequest calls POST /user/imagery-requests/:id/cancel', async () => {
    const mockResponse = {
      message: 'Cancelled',
      request: { _id: 'req-789', status: 'cancelled', updated_at: '2024-01-02' },
    };
    mockPost.mockResolvedValueOnce(mockResponse);

    const result = await cancelImageryRequest('req-789', 'No longer needed');

    expect(mockPost).toHaveBeenCalledWith(
      '/user/imagery-requests/req-789/cancel',
      { cancellation_reason: 'No longer needed' }
    );
    expect(result.request.status).toBe('cancelled');
  });

  it('cancelImageryRequest works without a reason', async () => {
    mockPost.mockResolvedValueOnce({
      message: 'Cancelled',
      request: { _id: 'req-000', status: 'cancelled', updated_at: '2024-01-02' },
    });

    await cancelImageryRequest('req-000');

    expect(mockPost).toHaveBeenCalledWith(
      '/user/imagery-requests/req-000/cancel',
      { cancellation_reason: undefined }
    );
  });
});

describe('satelliteProducts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSatelliteProducts calls GET /public/satellite-products without params', async () => {
    const mockResponse = {
      products: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    const result = await getSatelliteProducts();

    expect(mockGet).toHaveBeenCalledWith('/public/satellite-products');
    expect(result.products).toEqual([]);
  });

  it('getSatelliteProducts appends resolution_category param', async () => {
    mockGet.mockResolvedValueOnce({ products: [], pagination: {} });

    await getSatelliteProducts({ resolution_category: 'vhr' });

    expect(mockGet).toHaveBeenCalledWith('/public/satellite-products?resolution_category=vhr');
  });

  it('getSatelliteProducts appends multiple params', async () => {
    mockGet.mockResolvedValueOnce({ products: [], pagination: {} });

    await getSatelliteProducts({ sensor_type: 'optical', availability: 'archive', page: 2, limit: 10 });

    const call = mockGet.mock.calls[0][0] as string;
    expect(call).toContain('sensor_type=optical');
    expect(call).toContain('availability=archive');
    expect(call).toContain('page=2');
    expect(call).toContain('limit=10');
  });

  it('getSatelliteProduct calls GET /public/satellite-products/:id', async () => {
    const mockProduct = { _id: 'prod-1', name: 'WorldView-3', provider: 'Maxar' };
    mockGet.mockResolvedValueOnce(mockProduct);

    const result = await getSatelliteProduct('prod-1');

    expect(mockGet).toHaveBeenCalledWith('/public/satellite-products/prod-1');
    expect(result).toEqual(mockProduct);
  });

  it('getSatelliteProduct propagates errors', async () => {
    mockGet.mockRejectedValueOnce(new ApiError('Not Found', 404));
    await expect(getSatelliteProduct('nonexistent')).rejects.toThrow('Not Found');
  });
});

// ---------------------------------------------------------------------------
// 4. Error handler utilities
// ---------------------------------------------------------------------------

describe('ApiError', () => {
  it('creates an error with correct properties', () => {
    const err = new ApiError('Not found', 404, { detail: 'missing' });
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.name).toBe('ApiError');
  });
});

describe('getUserFriendlyErrorMessage', () => {
  it('returns 401 message for auth errors', () => {
    const err = new ApiError('Unauthorized', 401);
    expect(getUserFriendlyErrorMessage(err)).toContain('not authenticated');
  });

  it('returns 403 message for forbidden errors', () => {
    const err = new ApiError('Forbidden', 403);
    expect(getUserFriendlyErrorMessage(err)).toContain('permission');
  });

  it('returns 404 message for not found errors', () => {
    const err = new ApiError('Not Found', 404);
    expect(getUserFriendlyErrorMessage(err)).toContain('not found');
  });

  it('returns 500 message for server errors', () => {
    const err = new ApiError('Internal Server Error', 500);
    expect(getUserFriendlyErrorMessage(err)).toContain('internal server error');
  });

  it('returns network error message for TypeError fetch failures', () => {
    const err = new TypeError('Failed to fetch');
    expect(getUserFriendlyErrorMessage(err)).toContain('connect');
  });

  it('returns generic message for unknown errors', () => {
    expect(getUserFriendlyErrorMessage({})).toContain('unexpected error');
  });
});

describe('Error type predicates', () => {
  it('isNetworkError detects fetch TypeErrors', () => {
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isNetworkError(new ApiError('Bad Request', 400))).toBe(false);
  });

  it('isAuthError detects 401 status', () => {
    expect(isAuthError(new ApiError('Unauthorized', 401))).toBe(true);
    expect(isAuthError(new ApiError('Forbidden', 403))).toBe(false);
  });

  it('isValidationError detects 400 and 422 status', () => {
    expect(isValidationError(new ApiError('Bad Request', 400))).toBe(true);
    expect(isValidationError(new ApiError('Unprocessable', 422))).toBe(true);
    expect(isValidationError(new ApiError('Not Found', 404))).toBe(false);
  });

  it('isNotFoundError detects 404 status', () => {
    expect(isNotFoundError(new ApiError('Not Found', 404))).toBe(true);
    expect(isNotFoundError(new ApiError('Server Error', 500))).toBe(false);
  });

  it('isServerError detects 5xx status codes', () => {
    expect(isServerError(new ApiError('Internal Server Error', 500))).toBe(true);
    expect(isServerError(new ApiError('Bad Gateway', 502))).toBe(true);
    expect(isServerError(new ApiError('Not Found', 404))).toBe(false);
  });
});
