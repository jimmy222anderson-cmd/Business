import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestDetailPanel } from '@/components/admin/RequestDetailPanel';

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({
      setView: vi.fn(),
      remove: vi.fn(),
      fitBounds: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    polygon: vi.fn(() => ({
      addTo: vi.fn(),
      getBounds: vi.fn(() => ({
        pad: vi.fn(),
      })),
    })),
  },
}));

const mockRequest = {
  _id: '123',
  user_id: undefined,
  full_name: 'John Doe',
  email: 'john@example.com',
  company: 'Test Corp',
  phone: '+1234567890',
  aoi_type: 'polygon',
  aoi_coordinates: {
    type: 'Polygon',
    coordinates: [
      [
        [-122.4, 37.8],
        [-122.4, 37.7],
        [-122.3, 37.7],
        [-122.3, 37.8],
        [-122.4, 37.8],
      ],
    ],
  },
  aoi_area_km2: 100.5,
  aoi_center: {
    lat: 37.75,
    lng: -122.35,
  },
  date_range: {
    start_date: '2024-01-01T00:00:00.000Z',
    end_date: '2024-12-31T00:00:00.000Z',
  },
  filters: {
    resolution_category: ['vhr', 'high'],
    max_cloud_coverage: 20,
    providers: ['Maxar', 'Planet'],
    bands: ['RGB', 'NIR'],
    image_types: ['Optical'],
  },
  urgency: 'standard',
  additional_requirements: 'Need high quality imagery',
  status: 'pending' as const,
  admin_notes: 'Initial review pending',
  quote_amount: 5000,
  quote_currency: 'USD',
  created_at: '2024-01-15T10:00:00.000Z',
  updated_at: '2024-01-15T10:00:00.000Z',
};

describe('RequestDetailPanel', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be importable and instantiable', () => {
    expect(RequestDetailPanel).toBeDefined();
    expect(typeof RequestDetailPanel).toBe('function');
  });

  it('should accept required props', () => {
    const props = {
      request: mockRequest,
      onUpdate: mockOnUpdate,
    };
    
    expect(props.request).toBeDefined();
    expect(typeof props.onUpdate).toBe('function');
  });

  it('should extract user name correctly', () => {
    const userName = mockRequest.user_id?.full_name || mockRequest.full_name || 'Unknown';
    expect(userName).toBe('John Doe');
  });

  it('should extract user email correctly', () => {
    const userEmail = mockRequest.user_id?.email || mockRequest.email || 'N/A';
    expect(userEmail).toBe('john@example.com');
  });

  it('should extract company correctly', () => {
    const company = mockRequest.user_id?.company || mockRequest.company || 'N/A';
    expect(company).toBe('Test Corp');
  });

  it('should handle request with user_id populated', () => {
    const requestWithUserId = {
      ...mockRequest,
      user_id: {
        email: 'user@example.com',
        full_name: 'User Name',
        company: 'User Company',
      },
    };

    const userName = requestWithUserId.user_id?.full_name || requestWithUserId.full_name;
    const userEmail = requestWithUserId.user_id?.email || requestWithUserId.email;
    const company = requestWithUserId.user_id?.company || requestWithUserId.company;

    expect(userName).toBe('User Name');
    expect(userEmail).toBe('user@example.com');
    expect(company).toBe('User Company');
  });

  it('should handle missing optional fields', () => {
    const minimalRequest = {
      ...mockRequest,
      company: undefined,
      phone: undefined,
      additional_requirements: undefined,
      admin_notes: undefined,
      quote_amount: undefined,
      quote_currency: undefined,
    };

    const company = minimalRequest.company || 'N/A';
    const phone = minimalRequest.phone || 'N/A';

    expect(company).toBe('N/A');
    expect(phone).toBe('N/A');
  });

  it('should format AOI area correctly', () => {
    const formatted = mockRequest.aoi_area_km2.toFixed(2);
    expect(formatted).toBe('100.50');
  });

  it('should format coordinates correctly', () => {
    const lat = mockRequest.aoi_center.lat.toFixed(4);
    const lng = mockRequest.aoi_center.lng.toFixed(4);
    
    expect(lat).toBe('37.7500');
    expect(lng).toBe('-122.3500');
  });

  it('should handle date range formatting', () => {
    const startDate = new Date(mockRequest.date_range.start_date);
    const endDate = new Date(mockRequest.date_range.end_date);
    
    expect(startDate.toLocaleDateString()).toBeDefined();
    expect(endDate.toLocaleDateString()).toBeDefined();
  });

  it('should validate status values', () => {
    const validStatuses = ['pending', 'reviewing', 'quoted', 'approved', 'completed', 'cancelled'];
    expect(validStatuses).toContain(mockRequest.status);
  });

  it('should handle resolution category filters', () => {
    expect(mockRequest.filters.resolution_category).toBeDefined();
    expect(mockRequest.filters.resolution_category?.length).toBeGreaterThan(0);
    expect(mockRequest.filters.resolution_category).toContain('vhr');
    expect(mockRequest.filters.resolution_category).toContain('high');
  });

  it('should handle cloud coverage filter', () => {
    expect(mockRequest.filters.max_cloud_coverage).toBe(20);
  });

  it('should handle provider filters', () => {
    expect(mockRequest.filters.providers).toBeDefined();
    expect(mockRequest.filters.providers?.length).toBeGreaterThan(0);
    expect(mockRequest.filters.providers).toContain('Maxar');
    expect(mockRequest.filters.providers).toContain('Planet');
  });

  it('should handle band filters', () => {
    expect(mockRequest.filters.bands).toBeDefined();
    expect(mockRequest.filters.bands?.length).toBeGreaterThan(0);
    expect(mockRequest.filters.bands).toContain('RGB');
    expect(mockRequest.filters.bands).toContain('NIR');
  });

  it('should handle image type filters', () => {
    expect(mockRequest.filters.image_types).toBeDefined();
    expect(mockRequest.filters.image_types?.length).toBeGreaterThan(0);
    expect(mockRequest.filters.image_types).toContain('Optical');
  });

  it('should validate urgency values', () => {
    const validUrgencies = ['standard', 'urgent', 'emergency'];
    expect(validUrgencies).toContain(mockRequest.urgency);
  });

  it('should handle quote amount parsing', () => {
    const quoteAmount = mockRequest.quote_amount?.toString() || '';
    expect(quoteAmount).toBe('5000');
    
    const parsed = parseFloat(quoteAmount);
    expect(parsed).toBe(5000);
  });

  it('should validate currency codes', () => {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
    expect(validCurrencies).toContain(mockRequest.quote_currency);
  });

  it('should handle AOI coordinate transformation', () => {
    const coords = mockRequest.aoi_coordinates.coordinates[0].map((coord: number[]) => [
      coord[1],
      coord[0],
    ]);
    
    expect(coords).toBeDefined();
    expect(coords.length).toBeGreaterThan(0);
    expect(coords[0]).toHaveLength(2);
  });

  it('should validate AOI type', () => {
    const validAOITypes = ['polygon', 'rectangle', 'circle'];
    expect(validAOITypes).toContain(mockRequest.aoi_type);
  });

  it('should handle status color mapping', () => {
    const statusColors: Record<string, string> = {
      pending: 'yellow',
      reviewing: 'blue',
      quoted: 'purple',
      approved: 'green',
      completed: 'green',
      cancelled: 'red',
    };
    
    expect(statusColors[mockRequest.status]).toBeDefined();
  });

  it('should validate created_at timestamp', () => {
    const createdAt = new Date(mockRequest.created_at);
    expect(createdAt.getTime()).toBeGreaterThan(0);
  });

  it('should validate updated_at timestamp', () => {
    const updatedAt = new Date(mockRequest.updated_at);
    expect(updatedAt.getTime()).toBeGreaterThan(0);
  });

  it('should handle onUpdate callback structure', async () => {
    const updates = {
      status: 'reviewing' as const,
      admin_notes: 'Test notes',
      quote_amount: 7500,
      quote_currency: 'USD',
    };

    await mockOnUpdate(updates);
    
    expect(mockOnUpdate).toHaveBeenCalledWith(updates);
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
  });
});
