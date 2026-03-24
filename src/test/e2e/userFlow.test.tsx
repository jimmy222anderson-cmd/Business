/**
 * E2E Tests: Complete User Flow
 *
 * Tests the full user journey:
 *   1. Navigate to /explore
 *   2. Draw AOI on map (simulated via state injection)
 *   3. Fill request form
 *   4. Submit request
 *
 * Validates: AC-2.1–AC-2.9, AC-7.1–AC-7.10
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/api/imageryRequests', () => ({
  submitImageryRequest: vi.fn().mockResolvedValue({
    request_id: 'req-test-001',
    message: 'Request submitted successfully',
    request: {
      id: 'req-test-001',
      status: 'pending',
      aoi_area_km2: 100,
      created_at: new Date().toISOString(),
    },
  }),
  getUserImageryRequests: vi.fn().mockResolvedValue({
    requests: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  }),
}));

vi.mock('@/lib/api/savedAOIs', () => ({
  getSavedAOIs: vi.fn().mockResolvedValue({
    aois: [],
    pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
  }),
  createSavedAOI: vi.fn().mockResolvedValue({
    message: 'AOI saved',
    aoi: {
      _id: 'aoi-001',
      name: 'Test AOI',
      aoi_type: 'polygon',
      aoi_coordinates: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
      aoi_area_km2: 100,
      aoi_center: { lat: 0.5, lng: 0.5 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  }),
  deleteSavedAOI: vi.fn().mockResolvedValue({ message: 'Deleted' }),
  markAOIAsUsed: vi.fn().mockResolvedValue({ message: 'Marked as used' }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    refreshUser: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Leaflet map is not available in jsdom – stub the lazy map component
vi.mock('@/components/MapContainer.lazy', () => ({
  LazyMapContainer: ({ onAOIChange, onMapReady }: any) => {
    // Expose a button to simulate drawing an AOI
    return (
      <div data-testid="map-container">
        <button
          data-testid="simulate-draw-polygon"
          onClick={() =>
            onAOIChange({
              type: 'polygon',
              geoJSON: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
                },
              },
              coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
              area: 100.5,
              center: { lat: 0.5, lng: 0.5 },
              layer: null,
            })
          }
        >
          Draw Polygon
        </button>
        <button
          data-testid="simulate-draw-rectangle"
          onClick={() =>
            onAOIChange({
              type: 'rectangle',
              geoJSON: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
                },
              },
              coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
              area: 200.0,
              center: { lat: 1, lng: 1 },
              layer: null,
            })
          }
        >
          Draw Rectangle
        </button>
        <button
          data-testid="simulate-clear-aoi"
          onClick={() => onAOIChange(null)}
        >
          Clear AOI
        </button>
      </div>
    );
  },
}));

vi.mock('@/components/SearchBar', () => ({
  SearchBar: ({ onLocationSelect }: any) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        placeholder="Search for a location..."
        onChange={() => {}}
      />
      <button
        data-testid="search-select-result"
        onClick={() =>
          onLocationSelect({ name: 'London, UK', lat: 51.5, lng: -0.12 })
        }
      >
        Select London
      </button>
    </div>
  ),
}));

vi.mock('@/components/FilterPanel', () => ({
  FilterPanel: ({ onFilterChange }: any) => (
    <div data-testid="filter-panel">
      <button
        data-testid="apply-filter"
        onClick={() =>
          onFilterChange({
            selectedResolutions: ['vhr'],
            cloudCoverage: 20,
            selectedProviders: [],
            selectedBands: [],
            imageType: null,
            dateRange: { startDate: null, endDate: null },
          })
        }
      >
        Apply VHR Filter
      </button>
    </div>
  ),
}));

vi.mock('@/components/AOIFileUpload', () => ({
  AOIFileUpload: () => <div data-testid="aoi-file-upload" />,
}));

vi.mock('@/components/MobileBottomNav', () => ({
  MobileBottomNav: ({ onSubmitClick, hasAOI }: any) => (
    <div data-testid="mobile-bottom-nav">
      <button
        data-testid="mobile-submit-btn"
        onClick={onSubmitClick}
        disabled={!hasAOI}
      >
        Submit (Mobile)
      </button>
    </div>
  ),
}));

vi.mock('@/components/SaveAOIDialog', () => ({
  SaveAOIDialog: ({ open, onOpenChange, onSaveSuccess }: any) =>
    open ? (
      <div data-testid="save-aoi-dialog">
        <button
          data-testid="confirm-save-aoi"
          onClick={() => {
            onSaveSuccess?.();
            onOpenChange(false);
          }}
        >
          Save
        </button>
        <button onClick={() => onOpenChange(false)}>Cancel</button>
      </div>
    ) : null,
}));

vi.mock('@/components/SavedAOIsList', () => ({
  SavedAOIsList: ({ onLoadAOI }: any) => (
    <div data-testid="saved-aois-list">
      <button
        data-testid="load-saved-aoi"
        onClick={() =>
          onLoadAOI({
            _id: 'aoi-001',
            name: 'My Saved AOI',
            aoi_type: 'polygon',
            aoi_coordinates: {
              type: 'Polygon',
              coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
            },
            aoi_area_km2: 100,
            aoi_center: { lat: 0.5, lng: 0.5 },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      >
        Load My Saved AOI
      </button>
    </div>
  ),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

import ExplorerPage from '@/pages/ExplorerPage';
import { submitImageryRequest } from '@/lib/api/imageryRequests';

function renderExplorer() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <HelmetProvider>
        <MemoryRouter initialEntries={['/explore']}>
          <ExplorerPage />
        </MemoryRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('E2E: Complete User Flow – Draw AOI → Submit Request', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the explorer page with map and sidebar', () => {
    renderExplorer();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByText('EXPLORE')).toBeInTheDocument();
    expect(screen.getByText(/Search and request satellite imagery/i)).toBeInTheDocument();
  });

  it('AC-2.1 / AC-2.9: Submit button is disabled before AOI is drawn', () => {
    renderExplorer();
    const submitBtn = screen.getByRole('button', { name: /submit request/i });
    expect(submitBtn).toBeDisabled();
  });

  it('AC-2.1: Drawing a polygon enables the Submit Request button', async () => {
    renderExplorer();
    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });
    const submitBtn = screen.getByRole('button', { name: /submit request/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('AC-2.2: Drawing a rectangle also enables the Submit Request button', async () => {
    renderExplorer();
    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-rectangle'));
    });
    const submitBtn = screen.getByRole('button', { name: /submit request/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('AC-2.7: AOI area is displayed after drawing', async () => {
    renderExplorer();
    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });
    // Area badge shows in the map overlay (may appear in multiple elements)
    expect(screen.getAllByText(/100\.50 km²/).length).toBeGreaterThan(0);
  });

  it('AC-2.8: AOI coordinates (center) are displayed in the sidebar', async () => {
    renderExplorer();
    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });
    // Center coordinates shown in sidebar card
    expect(screen.getByText(/0\.5000, 0\.5000/)).toBeInTheDocument();
  });

  it('AC-2.5: Clearing AOI disables the Submit Request button again', async () => {
    renderExplorer();
    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });
    expect(screen.getByRole('button', { name: /submit request/i })).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-clear-aoi'));
    });
    expect(screen.getByRole('button', { name: /submit request/i })).toBeDisabled();
  });

  it('AC-7.1: Clicking Submit Request opens the request form with AOI data', async () => {
    renderExplorer();
    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit request/i }));
    });
    // Dialog title
    expect(screen.getByText('Request Satellite Imagery')).toBeInTheDocument();
    // AOI summary section
    expect(screen.getByText('Area of Interest Summary')).toBeInTheDocument();
  });

  it('AC-7.3 / AC-7.6: Form validates required fields before submission', async () => {
    renderExplorer();
    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit request/i }));
    });

    // Try to submit without filling required fields
    const submitFormBtn = screen.getByRole('button', { name: /^submit request$/i });
    await act(async () => {
      fireEvent.click(submitFormBtn);
    });

    // Validation errors should appear
    await waitFor(() => {
      expect(screen.getByText(/name must be at least/i)).toBeInTheDocument();
    });
  });

  it('AC-7.7 / AC-7.9: Successful form submission shows confirmation with request ID', async () => {
    renderExplorer();
    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit request/i }));
    });

    // Fill required fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Jane Smith' },
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'jane@example.com' },
      });
    });

    // Submit the form
    const submitFormBtn = screen.getByRole('button', { name: /^submit request$/i });
    await act(async () => {
      fireEvent.click(submitFormBtn);
    });

    await waitFor(() => {
      expect(submitImageryRequest).toHaveBeenCalledTimes(1);
    });

    // Success state
    await waitFor(() => {
      expect(screen.getByText(/request submitted successfully/i)).toBeInTheDocument();
    });

    // Request ID shown
    expect(screen.getByText(/req-test-001/i)).toBeInTheDocument();
  });

  it('AC-7.2: Request payload includes AOI data and filters', async () => {
    renderExplorer();

    // Apply a filter first
    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-filter'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit request/i }));
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Jane Smith' },
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'jane@example.com' },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^submit request$/i }));
    });

    await waitFor(() => {
      expect(submitImageryRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          aoi_type: 'polygon',
          aoi_area_km2: 100.5,
          aoi_center: { lat: 0.5, lng: 0.5 },
          filters: expect.objectContaining({
            resolution_category: ['vhr'],
            max_cloud_coverage: 20,
          }),
        })
      );
    });
  });
});
