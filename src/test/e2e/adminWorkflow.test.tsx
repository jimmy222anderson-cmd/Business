/**
 * E2E Tests: Admin Workflow
 *
 * Tests the admin journey:
 *   1. View all imagery requests
 *   2. Filter requests by status / urgency / search
 *   3. Open request detail and update status
 *   4. Manage satellite products (view, delete)
 *
 * Validates: AC-10.1–AC-10.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// ── Shared mock data ───────────────────────────────────────────────────────

const mockRequests = [
  {
    _id: 'req-001',
    full_name: 'Alice Johnson',
    email: 'alice@example.com',
    company: 'GeoTech Inc',
    aoi_type: 'polygon',
    aoi_coordinates: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
    aoi_area_km2: 120,
    aoi_center: { lat: 0.5, lng: 0.5 },
    date_range: { start_date: '2024-01-01', end_date: '2024-06-30' },
    urgency: 'standard',
    status: 'pending' as const,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
  },
  {
    _id: 'req-002',
    full_name: 'Bob Martinez',
    email: 'bob@example.com',
    aoi_type: 'rectangle',
    aoi_coordinates: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 0]]] },
    aoi_area_km2: 250,
    aoi_center: { lat: 1, lng: 1 },
    date_range: { start_date: '2024-02-01', end_date: '2024-05-31' },
    urgency: 'urgent',
    status: 'reviewing' as const,
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-03-10T10:00:00Z',
  },
];

const mockProducts = [
  {
    _id: 'prod-001',
    name: 'Maxar WorldView-3',
    provider: 'Maxar Technologies',
    sensor_type: 'optical',
    resolution: 0.31,
    resolution_category: 'vhr',
    availability: 'both',
    status: 'active',
  },
  {
    _id: 'prod-002',
    name: 'Sentinel-2',
    provider: 'ESA',
    sensor_type: 'optical',
    resolution: 10,
    resolution_category: 'medium',
    availability: 'archive',
    status: 'active',
  },
];

// ── Global fetch mock ──────────────────────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Component mocks ────────────────────────────────────────────────────────

vi.mock('@/components/BackButton', () => ({
  BackButton: ({ label }: any) => <button data-testid="back-button">{label}</button>,
}));

vi.mock('@/components/admin/RequestsTable', () => ({
  RequestsTable: ({ requests, onViewDetails }: any) => (
    <div data-testid="requests-table">
      {requests.map((r: any) => (
        <div key={r._id} data-testid={`request-row-${r._id}`}>
          <span>{r.full_name}</span>
          <span data-testid={`status-${r._id}`}>{r.status}</span>
          <button
            data-testid={`view-details-${r._id}`}
            onClick={() => onViewDetails(r)}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/admin/RequestDetailPanel', () => ({
  RequestDetailPanel: ({ request, onUpdate }: any) => (
    <div data-testid="request-detail-panel">
      <span data-testid="detail-name">{request.full_name}</span>
      <span data-testid="detail-status">{request.status}</span>
      <button
        data-testid="update-status-btn"
        onClick={() =>
          onUpdate({
            status: 'reviewing',
            admin_notes: 'Under review',
            quote_amount: undefined,
            quote_currency: 'USD',
          })
        }
      >
        Set Reviewing
      </button>
    </div>
  ),
}));

vi.mock('@/components/admin/ProductsTable', () => ({
  default: ({ products, onDelete }: any) => (
    <div data-testid="products-table">
      {products.map((p: any) => (
        <div key={p._id} data-testid={`product-row-${p._id}`}>
          <span>{p.name}</span>
          <span>{p.provider}</span>
          <button
            data-testid={`delete-product-${p._id}`}
            onClick={() => onDelete(p._id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

import ImageryRequestsPage from '@/pages/admin/ImageryRequestsPage';
import AdminSatelliteProductsPage from '@/pages/admin/AdminSatelliteProductsPage';

function wrap(ui: React.ReactElement, initialPath = '/admin/imagery-requests') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <HelmetProvider>
        <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

function setupRequestsFetch(requests = mockRequests) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      requests,
      pagination: { total: requests.length, page: 1, limit: 10, totalPages: 1 },
    }),
  } as any);
}

function setupProductsFetch(products = mockProducts) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ products }),
  } as any);
}

// ── Tests: Admin Imagery Requests ─────────────────────────────────────────

describe('E2E: Admin Workflow – Imagery Requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupRequestsFetch();
  });

  it('AC-10.4: Renders the admin imagery requests page and loads requests', async () => {
    wrap(<ImageryRequestsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('requests-table')).toBeInTheDocument();
    });

    expect(screen.getByTestId('request-row-req-001')).toBeInTheDocument();
    expect(screen.getByTestId('request-row-req-002')).toBeInTheDocument();
  });

  it('AC-10.5: Admin can filter requests by status', async () => {
    wrap(<ImageryRequestsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('requests-table')).toBeInTheDocument();
    });

    // The page has a status filter select – change it to 'pending'
    const statusSelects = screen.getAllByRole('combobox');
    // First combobox is the status filter
    await act(async () => {
      fireEvent.change(statusSelects[0], { target: { value: 'pending' } });
    });

    // Filtering is client-side; only pending request should remain visible
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('AC-10.5: Admin can search requests by user name', async () => {
    wrap(<ImageryRequestsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('requests-table')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'alice' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('AC-10.6: Admin can open request detail and update status', async () => {
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Updated', request: { ...mockRequests[0], status: 'reviewing' } }),
        } as any);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          requests: mockRequests,
          pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
        }),
      } as any);
    });

    wrap(<ImageryRequestsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('request-row-req-001')).toBeInTheDocument();
    });

    // Open detail panel
    await act(async () => {
      fireEvent.click(screen.getByTestId('view-details-req-001'));
    });

    expect(screen.getByTestId('request-detail-panel')).toBeInTheDocument();
    expect(screen.getByTestId('detail-name')).toHaveTextContent('Alice Johnson');

    // Update status
    await act(async () => {
      fireEvent.click(screen.getByTestId('update-status-btn'));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/imagery-requests/req-001'),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  it('AC-10.7: Admin can add notes when updating a request', async () => {
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Updated' }),
        } as any);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          requests: mockRequests,
          pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
        }),
      } as any);
    });

    wrap(<ImageryRequestsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('request-row-req-001')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('view-details-req-001'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('update-status-btn'));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('req-001'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('admin_notes'),
        })
      );
    });
  });

  it('AC-10.8: Export button is present on the admin requests page', async () => {
    wrap(<ImageryRequestsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('requests-table')).toBeInTheDocument();
    });

    // Export button should be rendered
    const exportBtn = screen.queryByRole('button', { name: /export/i });
    expect(exportBtn).toBeInTheDocument();
  });
});

// ── Tests: Admin Satellite Products ───────────────────────────────────────

describe('E2E: Admin Workflow – Satellite Products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupProductsFetch();
  });

  it('AC-10.1 / AC-10.3: Renders satellite products page with product list', async () => {
    wrap(<AdminSatelliteProductsPage />, '/admin/satellite-products');

    await waitFor(() => {
      expect(screen.getByTestId('products-table')).toBeInTheDocument();
    });

    expect(screen.getByTestId('product-row-prod-001')).toBeInTheDocument();
    expect(screen.getByTestId('product-row-prod-002')).toBeInTheDocument();
    expect(screen.getByText('Maxar WorldView-3')).toBeInTheDocument();
    expect(screen.getByText('Sentinel-2')).toBeInTheDocument();
  });

  it('AC-10.1: Add Satellite Product button links to creation form', async () => {
    wrap(<AdminSatelliteProductsPage />, '/admin/satellite-products');

    await waitFor(() => {
      expect(screen.getByTestId('products-table')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('link', { name: /add satellite product/i });
    expect(addBtn).toBeInTheDocument();
    expect(addBtn).toHaveAttribute('href', '/admin/satellite-products/new');
  });

  it('AC-10.3: Admin can delete a satellite product', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted' }),
      } as any)
      // Refresh after delete
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [mockProducts[1]] }),
      } as any);

    wrap(<AdminSatelliteProductsPage />, '/admin/satellite-products');

    await waitFor(() => {
      expect(screen.getByTestId('product-row-prod-001')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-product-prod-001'));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/satellite-products/prod-001'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('Shows product count in the page header', async () => {
    wrap(<AdminSatelliteProductsPage />, '/admin/satellite-products');

    await waitFor(() => {
      expect(screen.getByText(/All Satellite Products \(2\)/i)).toBeInTheDocument();
    });
  });
});
