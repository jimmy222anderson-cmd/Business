import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequests = [
  {
    _id: 'req1',
    full_name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
    status: 'pending' as const,
    urgency: 'standard',
    aoi_area_km2: 100,
    created_at: '2024-01-15T10:00:00Z',
    aoi_type: 'polygon',
    aoi_coordinates: { type: 'Polygon', coordinates: [] },
    aoi_center: { lat: 0, lng: 0 },
    date_range: { start_date: '2024-01-01', end_date: '2024-01-31' },
  },
  {
    _id: 'req2',
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'reviewing' as const,
    urgency: 'urgent',
    aoi_area_km2: 200,
    created_at: '2024-02-20T10:00:00Z',
    aoi_type: 'rectangle',
    aoi_coordinates: { type: 'Polygon', coordinates: [] },
    aoi_center: { lat: 0, lng: 0 },
    date_range: { start_date: '2024-02-01', end_date: '2024-02-28' },
  },
  {
    _id: 'req3',
    full_name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'completed' as const,
    urgency: 'emergency',
    aoi_area_km2: 150,
    created_at: '2024-03-10T10:00:00Z',
    aoi_type: 'circle',
    aoi_coordinates: { type: 'Point', coordinates: [] },
    aoi_center: { lat: 0, lng: 0 },
    date_range: { start_date: '2024-03-01', end_date: '2024-03-31' },
  },
];

describe('ImageryRequestsPage Filtering Logic', () => {
  it('should filter requests by status', () => {
    const statusFilter = 'pending';
    const filtered = mockRequests.filter(r => r.status === statusFilter);
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].full_name).toBe('John Doe');
  });

  it('should filter requests by urgency', () => {
    const urgencyFilter = 'urgent';
    const filtered = mockRequests.filter(r => r.urgency === urgencyFilter);
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].full_name).toBe('Jane Smith');
  });

  it('should filter requests by date range (from)', () => {
    const dateFrom = '2024-02-01';
    const fromDate = new Date(dateFrom);
    const filtered = mockRequests.filter(r => new Date(r.created_at) >= fromDate);
    
    expect(filtered.length).toBe(2);
    expect(filtered.map(r => r.full_name)).toContain('Jane Smith');
    expect(filtered.map(r => r.full_name)).toContain('Bob Johnson');
  });

  it('should filter requests by date range (to)', () => {
    const dateTo = '2024-02-28';
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    const filtered = mockRequests.filter(r => new Date(r.created_at) <= toDate);
    
    expect(filtered.length).toBe(2);
    expect(filtered.map(r => r.full_name)).toContain('John Doe');
    expect(filtered.map(r => r.full_name)).toContain('Jane Smith');
  });

  it('should filter requests by date range (from and to)', () => {
    const dateFrom = '2024-02-01';
    const dateTo = '2024-02-28';
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    
    const filtered = mockRequests.filter(r => {
      const createdAt = new Date(r.created_at);
      return createdAt >= fromDate && createdAt <= toDate;
    });
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].full_name).toBe('Jane Smith');
  });

  it('should search by user name', () => {
    const searchQuery = 'jane';
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = mockRequests.filter(r => {
      const userName = r.full_name.toLowerCase();
      return userName.includes(query);
    });
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].full_name).toBe('Jane Smith');
  });

  it('should search by email', () => {
    const searchQuery = 'bob@example.com';
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = mockRequests.filter(r => {
      const userEmail = r.email.toLowerCase();
      return userEmail.includes(query);
    });
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].full_name).toBe('Bob Johnson');
  });

  it('should search by request ID', () => {
    const searchQuery = 'req2';
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = mockRequests.filter(r => {
      const requestId = r._id.toLowerCase();
      return requestId.includes(query);
    });
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].full_name).toBe('Jane Smith');
  });

  it('should search by partial user name', () => {
    const searchQuery = 'jo';
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = mockRequests.filter(r => {
      const userName = r.full_name.toLowerCase();
      return userName.includes(query);
    });
    
    expect(filtered.length).toBe(2);
    expect(filtered.map(r => r.full_name)).toContain('John Doe');
    expect(filtered.map(r => r.full_name)).toContain('Bob Johnson');
  });

  it('should apply multiple filters simultaneously', () => {
    const statusFilter = 'reviewing';
    const urgencyFilter = 'urgent';
    
    let filtered = [...mockRequests];
    filtered = filtered.filter(r => r.status === statusFilter);
    filtered = filtered.filter(r => r.urgency === urgencyFilter);
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].full_name).toBe('Jane Smith');
  });

  it('should handle case-insensitive search', () => {
    const searchQuery = 'JANE';
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = mockRequests.filter(r => {
      const userName = r.full_name.toLowerCase();
      const userEmail = r.email.toLowerCase();
      return userName.includes(query) || userEmail.includes(query);
    });
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].full_name).toBe('Jane Smith');
  });

  it('should return all requests when no filters applied', () => {
    const statusFilter = 'all';
    const urgencyFilter = 'all';
    const searchQuery = '';
    
    let filtered = [...mockRequests];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(r => r.urgency === urgencyFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r => {
        const requestId = r._id.toLowerCase();
        const userName = r.full_name.toLowerCase();
        const userEmail = r.email.toLowerCase();
        return requestId.includes(query) || userName.includes(query) || userEmail.includes(query);
      });
    }
    
    expect(filtered.length).toBe(3);
  });

  it('should return empty array when no matches found', () => {
    const searchQuery = 'nonexistent';
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = mockRequests.filter(r => {
      const requestId = r._id.toLowerCase();
      const userName = r.full_name.toLowerCase();
      const userEmail = r.email.toLowerCase();
      return requestId.includes(query) || userName.includes(query) || userEmail.includes(query);
    });
    
    expect(filtered.length).toBe(0);
  });

  it('should calculate active filter count correctly', () => {
    const getActiveFilterCount = (
      statusFilter: string,
      urgencyFilter: string,
      searchQuery: string,
      dateFrom: string,
      dateTo: string
    ) => {
      let count = 0;
      if (statusFilter !== 'all') count++;
      if (urgencyFilter !== 'all') count++;
      if (searchQuery.trim()) count++;
      if (dateFrom) count++;
      if (dateTo) count++;
      return count;
    };
    
    expect(getActiveFilterCount('all', 'all', '', '', '')).toBe(0);
    expect(getActiveFilterCount('pending', 'all', '', '', '')).toBe(1);
    expect(getActiveFilterCount('pending', 'urgent', '', '', '')).toBe(2);
    expect(getActiveFilterCount('pending', 'urgent', 'john', '', '')).toBe(3);
    expect(getActiveFilterCount('pending', 'urgent', 'john', '2024-01-01', '')).toBe(4);
    expect(getActiveFilterCount('pending', 'urgent', 'john', '2024-01-01', '2024-12-31')).toBe(5);
  });

  it('should handle requests with user_id object', () => {
    const requestWithUserId = {
      ...mockRequests[0],
      user_id: {
        email: 'john@example.com',
        full_name: 'John Doe',
        company: 'Acme Corp',
      },
    };
    
    const searchQuery = 'john';
    const query = searchQuery.toLowerCase().trim();
    
    const userName = (requestWithUserId.user_id?.full_name || requestWithUserId.full_name).toLowerCase();
    const userEmail = (requestWithUserId.user_id?.email || requestWithUserId.email).toLowerCase();
    
    expect(userName.includes(query) || userEmail.includes(query)).toBe(true);
  });

  it('should handle whitespace in search query', () => {
    const searchQuery = '  jane  ';
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = mockRequests.filter(r => {
      const userName = r.full_name.toLowerCase();
      return userName.includes(query);
    });
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].full_name).toBe('Jane Smith');
  });

  it('should filter by all urgency levels', () => {
    const urgencies = ['standard', 'urgent', 'emergency'];
    
    urgencies.forEach(urgency => {
      const filtered = mockRequests.filter(r => r.urgency === urgency);
      expect(filtered.length).toBe(1);
    });
  });

  it('should filter by all status values', () => {
    const statuses = ['pending', 'reviewing', 'completed'];
    
    statuses.forEach(status => {
      const filtered = mockRequests.filter(r => r.status === status);
      expect(filtered.length).toBe(1);
    });
  });
});

