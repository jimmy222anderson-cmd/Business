/**
 * E2E Tests: Mobile Responsiveness
 *
 * Validates that key UI flows work correctly at mobile viewport sizes.
 * Simulates mobile (375×667) and tablet (768×1024) breakpoints via
 * window.innerWidth / matchMedia mocking.
 *
 * Validates: NFR-16, AC-2.1–AC-2.9, AC-7.1–AC-7.10
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// ── Viewport helpers ───────────────────────────────────────────────────────

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });

  // Update matchMedia to reflect the new width
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      // Simple mobile-first breakpoint simulation
      const matches =
        (query.includes('max-width: 767px') && width <= 767) ||
        (query.includes('max-width: 1023px') && width <= 1023) ||
        (query.includes('min-width: 768px') && width >= 768) ||
        (query.includes('min-width: 1024px') && width >= 1024);
      return {
        matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
    },
  });

  window.dispatchEvent(new Event('resize'));
}

const MOBILE = { width: 375, height: 667 } as const;
const TABLET = { width: 768, height: 1024 } as const;
const DESKTOP = { width: 1920, height: 1080 } as const;

// ── API / component mocks ──────────────────────────────────────────────────

vi.mock('@/lib/api/imageryRequests', () => ({
  submitImageryRequest: vi.fn().mockResolvedValue({
    request_id: 'req-mobile-001',
    message: 'Request submitted successfully',
    request: { id: 'req-mobile-001', status: 'pending', aoi_area_km2: 50 },
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
  createSavedAOI: vi.fn().mockResolvedValue({ message: 'Saved' }),
  deleteSavedAOI: vi.fn().mockResolvedValue({ message: 'Deleted' }),
  markAOIAsUsed: vi.fn().mockResolvedValue({ message: 'Used' }),
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

vi.mock('@/components/MapContainer.lazy', () => ({
  LazyMapContainer: ({ onAOIChange }: any) => (
    <div data-testid="map-container">
      <button
        data-testid="simulate-draw-polygon"
        onClick={() =>
          onAOIChange({
            type: 'polygon',
            geoJSON: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
            },
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
            area: 50.0,
            center: { lat: 0.5, lng: 0.5 },
            layer: null,
          })
        }
      >
        Draw Polygon
      </button>
    </div>
  ),
}));

vi.mock('@/components/SearchBar', () => ({
  SearchBar: ({ onLocationSelect }: any) => (
    <div data-testid="search-bar">
      <input data-testid="search-input" placeholder="Search for a location..." />
      <button
        data-testid="search-select-result"
        onClick={() => onLocationSelect({ name: 'Karachi', lat: 24.86, lng: 67.01 })}
      >
        Select Karachi
      </button>
    </div>
  ),
}));

vi.mock('@/components/FilterPanel', () => ({
  FilterPanel: ({ onFilterChange }: any) => (
    <div data-testid="filter-panel">
      <button data-testid="apply-filter" onClick={() => onFilterChange({})}>
        Filter
      </button>
    </div>
  ),
}));

vi.mock('@/components/AOIFileUpload', () => ({
  AOIFileUpload: () => <div data-testid="aoi-file-upload" />,
}));

vi.mock('@/components/MobileBottomNav', () => ({
  MobileBottomNav: ({ onSubmitClick, hasAOI, onFilterToggle }: any) => (
    <div data-testid="mobile-bottom-nav">
      <button data-testid="mobile-filter-btn" onClick={onFilterToggle}>
        Filters
      </button>
      <button
        data-testid="mobile-submit-btn"
        onClick={onSubmitClick}
        disabled={!hasAOI}
        aria-disabled={!hasAOI}
      >
        Submit (Mobile)
      </button>
    </div>
  ),
}));

vi.mock('@/components/SaveAOIDialog', () => ({
  SaveAOIDialog: ({ open, onOpenChange }: any) =>
    open ? (
      <div data-testid="save-aoi-dialog">
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/components/SavedAOIsList', () => ({
  SavedAOIsList: () => <div data-testid="saved-aois-list" />,
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

describe('E2E: Mobile Responsiveness – Explorer Page', () => {
  afterEach(() => {
    // Reset to desktop after each test
    setViewport(DESKTOP.width, DESKTOP.height);
    vi.clearAllMocks();
  });

  it('NFR-16: Explorer page renders at mobile viewport (375×667)', () => {
    setViewport(MOBILE.width, MOBILE.height);
    renderExplorer();

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('NFR-16: Mobile bottom nav is rendered at mobile viewport', () => {
    setViewport(MOBILE.width, MOBILE.height);
    renderExplorer();

    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
  });

  it('AC-2.1 / NFR-16: Drawing AOI at mobile viewport enables mobile submit button', async () => {
    setViewport(MOBILE.width, MOBILE.height);
    renderExplorer();

    const mobileSubmitBtn = screen.getByTestId('mobile-submit-btn');
    expect(mobileSubmitBtn).toBeDisabled();

    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('mobile-submit-btn')).not.toBeDisabled();
    });
  });

  it('AC-7.1 / NFR-16: Mobile submit button opens request form', async () => {
    setViewport(MOBILE.width, MOBILE.height);
    renderExplorer();

    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('mobile-submit-btn'));
    });

    await waitFor(() => {
      expect(screen.getByText('Request Satellite Imagery')).toBeInTheDocument();
    });
  });

  it('AC-7.7 / NFR-16: Full request submission flow works on mobile', async () => {
    setViewport(MOBILE.width, MOBILE.height);
    renderExplorer();

    // Draw AOI
    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });

    // Open form via mobile button
    await act(async () => {
      fireEvent.click(screen.getByTestId('mobile-submit-btn'));
    });

    await waitFor(() => {
      expect(screen.getByText('Request Satellite Imagery')).toBeInTheDocument();
    });

    // Fill required fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Mobile User' },
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'mobile@example.com' },
      });
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^submit request$/i }));
    });

    await waitFor(() => {
      expect(submitImageryRequest).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText(/request submitted successfully/i)).toBeInTheDocument();
    });
  });

  it('NFR-16: Explorer page renders at tablet viewport (768×1024)', () => {
    setViewport(TABLET.width, TABLET.height);
    renderExplorer();

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('AC-2.1 / NFR-16: Drawing AOI at tablet viewport enables submit button', async () => {
    setViewport(TABLET.width, TABLET.height);
    renderExplorer();

    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });

    // At tablet width the desktop submit button should be enabled
    const submitBtn = screen.queryByRole('button', { name: /submit request/i });
    if (submitBtn) {
      expect(submitBtn).not.toBeDisabled();
    } else {
      // Falls back to mobile nav at tablet
      expect(screen.getByTestId('mobile-submit-btn')).not.toBeDisabled();
    }
  });

  it('NFR-16: Explorer page renders at desktop viewport (1920×1080)', () => {
    setViewport(DESKTOP.width, DESKTOP.height);
    renderExplorer();

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('AC-2.7 / NFR-16: AOI area badge is visible after drawing on mobile', async () => {
    setViewport(MOBILE.width, MOBILE.height);
    renderExplorer();

    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });

    await waitFor(() => {
      expect(screen.getAllByText(/50\.00 km²/).length).toBeGreaterThan(0);
    });
  });

  it('NFR-16: Search bar is accessible on mobile viewport', () => {
    setViewport(MOBILE.width, MOBILE.height);
    renderExplorer();

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeVisible();
  });

  it('NFR-16: Filter panel is accessible on mobile viewport', () => {
    setViewport(MOBILE.width, MOBILE.height);
    renderExplorer();

    // Filter panel should be in the DOM (may be collapsed)
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
  });
});

describe('E2E: Mobile Responsiveness – Viewport Boundary Checks', () => {
  afterEach(() => {
    setViewport(DESKTOP.width, DESKTOP.height);
    vi.clearAllMocks();
  });

  it('Window innerWidth is correctly set to mobile value', () => {
    setViewport(MOBILE.width, MOBILE.height);
    expect(window.innerWidth).toBe(375);
    expect(window.innerHeight).toBe(667);
  });

  it('Window innerWidth is correctly set to tablet value', () => {
    setViewport(TABLET.width, TABLET.height);
    expect(window.innerWidth).toBe(768);
    expect(window.innerHeight).toBe(1024);
  });

  it('matchMedia max-width:767px matches on mobile', () => {
    setViewport(MOBILE.width, MOBILE.height);
    expect(window.matchMedia('(max-width: 767px)').matches).toBe(true);
  });

  it('matchMedia max-width:767px does not match on tablet', () => {
    setViewport(TABLET.width, TABLET.height);
    expect(window.matchMedia('(max-width: 767px)').matches).toBe(false);
  });

  it('matchMedia min-width:768px matches on tablet', () => {
    setViewport(TABLET.width, TABLET.height);
    expect(window.matchMedia('(min-width: 768px)').matches).toBe(true);
  });

  it('matchMedia min-width:1024px matches on desktop', () => {
    setViewport(DESKTOP.width, DESKTOP.height);
    expect(window.matchMedia('(min-width: 1024px)').matches).toBe(true);
  });
});
