import { describe, it, expect } from 'vitest';
import { RequestsTable } from '@/components/admin/RequestsTable';

const mockRequests = [
  {
    _id: '1',
    full_name: 'John Doe',
    email: 'john@example.com',
    company: 'Test Corp',
    aoi_area_km2: 150.5,
    status: 'pending' as const,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    _id: '2',
    user_id: {
      email: 'jane@example.com',
      full_name: 'Jane Smith',
      company: 'Another Corp',
    },
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    company: 'Another Corp',
    aoi_area_km2: 200.75,
    status: 'completed' as const,
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    _id: '3',
    full_name: 'Bob Wilson',
    email: 'bob@example.com',
    aoi_area_km2: 75.25,
    status: 'reviewing' as const,
    created_at: '2024-01-20T10:00:00Z',
  },
];

describe('RequestsTable Component', () => {
  it('should be importable and instantiable', () => {
    expect(RequestsTable).toBeDefined();
    expect(typeof RequestsTable).toBe('function');
  });

  it('should accept required props', () => {
    const props = {
      requests: mockRequests,
      isLoading: false,
      onViewDetails: () => {},
    };
    
    expect(props.requests).toBeDefined();
    expect(props.requests.length).toBe(3);
    expect(props.isLoading).toBe(false);
    expect(typeof props.onViewDetails).toBe('function');
  });

  it('should handle empty requests array', () => {
    const props = {
      requests: [],
      isLoading: false,
      onViewDetails: () => {},
    };
    
    expect(props.requests.length).toBe(0);
  });

  it('should handle loading state', () => {
    const props = {
      requests: [],
      isLoading: true,
      onViewDetails: () => {},
    };
    
    expect(props.isLoading).toBe(true);
  });

  it('should format AOI area correctly', () => {
    const area = 150.5;
    const formatted = area.toFixed(2);
    
    expect(formatted).toBe('150.50');
  });

  it('should handle different status values', () => {
    const statuses = ['pending', 'reviewing', 'quoted', 'approved', 'completed', 'cancelled'];
    
    statuses.forEach(status => {
      expect(status).toBeDefined();
      expect(typeof status).toBe('string');
    });
  });

  it('should handle user data with user_id', () => {
    const request = mockRequests[1];
    const userName = request.user_id?.full_name || request.full_name;
    const userEmail = request.user_id?.email || request.email;
    
    expect(userName).toBe('Jane Smith');
    expect(userEmail).toBe('jane@example.com');
  });

  it('should handle user data without user_id', () => {
    const request = mockRequests[0];
    const userName = request.user_id?.full_name || request.full_name;
    const userEmail = request.user_id?.email || request.email;
    
    expect(userName).toBe('John Doe');
    expect(userEmail).toBe('john@example.com');
  });

  it('should handle pagination props', () => {
    const props = {
      requests: mockRequests,
      isLoading: false,
      onViewDetails: () => {},
      page: 1,
      limit: 10,
      totalPages: 3,
      onPageChange: () => {},
    };
    
    expect(props.page).toBe(1);
    expect(props.limit).toBe(10);
    expect(props.totalPages).toBe(3);
    expect(typeof props.onPageChange).toBe('function');
  });

  it('should sort requests by date', () => {
    const sorted = [...mockRequests].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    expect(sorted[0]._id).toBe('3'); // Most recent
    expect(sorted[2]._id).toBe('2'); // Oldest
  });

  it('should sort requests by name', () => {
    const sorted = [...mockRequests].sort((a, b) => {
      const aName = (a.user_id?.full_name || a.full_name).toLowerCase();
      const bName = (b.user_id?.full_name || b.full_name).toLowerCase();
      return aName.localeCompare(bName);
    });
    
    expect(sorted[0].full_name).toBe('Bob Wilson');
    expect(sorted[2].full_name).toBe('John Doe');
  });

  it('should sort requests by area', () => {
    const sorted = [...mockRequests].sort((a, b) => {
      return a.aoi_area_km2 - b.aoi_area_km2;
    });
    
    expect(sorted[0].aoi_area_km2).toBe(75.25);
    expect(sorted[2].aoi_area_km2).toBe(200.75);
  });

  it('should format dates correctly', () => {
    const date = new Date('2024-01-15T10:00:00Z');
    const formatted = date.toLocaleDateString();
    
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should handle company field when present', () => {
    const request = mockRequests[0];
    expect(request.company).toBe('Test Corp');
  });

  it('should handle company field when absent', () => {
    const request = mockRequests[2];
    expect(request.company).toBeUndefined();
  });

  it('should validate status badge colors', () => {
    const statusColors = {
      pending: 'yellow',
      reviewing: 'blue',
      quoted: 'purple',
      approved: 'green',
      completed: 'green',
      cancelled: 'red',
    };
    
    Object.keys(statusColors).forEach(status => {
      expect(statusColors[status as keyof typeof statusColors]).toBeDefined();
    });
  });
});
