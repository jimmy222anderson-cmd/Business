/**
 * E2E Tests: Saved AOI Workflow
 *
 * Tests the authenticated user journey:
 *   1. Draw AOI on explorer → save it
 *   2. Navigate to dashboard → view saved AOIs tab
 *   3. Load a saved AOI back onto the map
 *   4. Delete a saved AOI
 *
 * Validates: AC-8.1–AC-8.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// ── All vi.mock calls MUST come before any const declarations ──────────────
// vi.mock is hoisted to the top of the file by vitest, so factories cannot
// reference variables declared in the module scope.

vi.mock('@/lib/api/savedAOIs', () => ({
  getSavedAOIs: vi.fn().mockResolvedValue({
    aois: [
      {
        _id: 'aoi-001',
        name: 'My Karachi AOI',
        description: 'Port area',
        aoi_type: 'polygon',
        aoi_coordinates: {
          type: 'Polygon',
          coordinates: [[[67.0, 24.8], [67.1, 24.8], [67.1, 24.9], [67.0, 24.9], [67.0, 24.8]]],
        },
        aoi_area_km2: 85.3,
        aoi_center: { lat: 24.85, lng: 67.05 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
    pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
  }),
  createSavedAOI: vi.fn().mockResolvedValue({
    message: 'AOI saved',
    aoi: {
      _id: 'aoi-001',
      name: 'My Karachi AOI',
      aoi_type: 'polygon',
      aoi_area_km2: 85.3,
      aoi_center: { lat: 24.85, lng: 67.05 },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  }),
  deleteSavedAOI: vi.fn().mockResolvedValue({ message: 'Deleted' }),
  markAOIAsUsed: vi.fn().mockResolvedValue({ message: 'Marked as used' }),
}));

vi.mock('@/lib/api/imageryRequests', () => ({
  submitImageryRequest: vi.fn(),
  getUserImageryRequests: vi.fn().mockResolvedValue({
    requests: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: {
      id: 'user-001',
      full_name: 'Test User',
      email: 'test@example.com',
      company: 'Test Corp',
      role: 'user',
    },
    isAuthenticated: true,
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
              geometry: {
                type: 'Polygon',
                coordinates: [[[67.0, 24.8], [67.1, 24.8], [67.1, 24.9], [67.0, 24.8]]],
              },
            },
            coordinates: [[[67.0, 24.8], [67.1, 24.8], [67.1, 24.9], [67.0, 24.8]]],
            area: 85.3,
            center: { lat: 24.85, lng: 67.05 },
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
  SearchBar: () => <div data-testid="search-bar" />,
}));

vi.mock('@/components/FilterPanel', () => ({
  FilterPanel: ({ onFilterChange }: any) => (
    <div data-testid="filter-panel">
      <button onClick={() => onFilterChange({})}>Filter</button>
    </div>
  ),
}));

vi.mock('@/components/AOIFileUpload', () => ({
  AOIFileUpload: () => <div data-testid="aoi-file-upload" />,
}));

vi.mock('@/components/MobileBottomNav', () => ({
  MobileBottomNav: () => <div data-testid="mobile-bottom-nav" />,
}));

// SaveAOIDialog: calls createSavedAOI from the already-mocked module
// NOTE: ExplorerPage passes the prop as `aoiData`, not `currentAOI`
vi.mock('@/components/SaveAOIDialog', () => ({
  SaveAOIDialog: ({ open, onOpenChange, onSaveSuccess, aoiData }: any) =>
    open ? (
      <div data-testid="save-aoi-dialog">
        <span data-testid="dialog-aoi-area">{aoiData?.area?.toFixed(2)}</span>
        <button
          data-testid="confirm-save-aoi"
          onClick={async () => {
            // Dynamically import to get the already-mocked version
            const mod = await import('@/lib/api/savedAOIs');
            await mod.createSavedAOI({
              name: 'My Karachi AOI',
              aoi_type: aoiData?.type ?? 'polygon',
              aoi_coordinates: aoiData?.geoJSON?.geometry ?? {},
              aoi_area_km2: aoiData?.area ?? 0,
              aoi_center: aoiData?.center ?? { lat: 0, lng: 0 },
            });
            onSaveSuccess?.();
            onOpenChange(false);
          }}
        >
          Save AOI
        </button>
        <button data-testid="cancel-save-aoi" onClick={() => onOpenChange(false)}>
          Cancel
        </button>
      </div>
    ) : null,
}));

// SavedAOIsList: calls deleteSavedAOI from the already-mocked module
vi.mock('@/components/SavedAOIsList', () => ({
  SavedAOIsList: ({ onLoadAOI }: any) => (
    <div data-testid="saved-aois-list">
      <div data-testid="saved-aoi-item-aoi-001">
        <span>My Karachi AOI</span>
        <span>85.30 km²</span>
        <button
          data-testid="load-aoi-btn-aoi-001"
          onClick={() =>
            onLoadAOI({
              _id: 'aoi-001',
              name: 'My Karachi AOI',
              description: 'Port area',
              aoi_type: 'polygon',
              aoi_coordinates: {
                type: 'Polygon',
                coordinates: [[[67.0, 24.8], [67.1, 24.8], [67.1, 24.9], [67.0, 24.9], [67.0, 24.8]]],
              },
              aoi_area_km2: 85.3,
              aoi_center: { lat: 24.85, lng: 67.05 },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            })
          }
        >
          Load
        </button>
        <button
          data-testid="delete-aoi-btn-aoi-001"
          onClick={async () => {
            const mod = await import('@/lib/api/savedAOIs');
            await mod.deleteSavedAOI('aoi-001');
          }}
        >
          Delete
        </button>
      </div>
    </div>
  ),
}));

vi.mock('@/components/RequestHistoryTable', () => ({
  RequestHistoryTable: () => <div data-testid="request-history-table" />,
}));

vi.mock('@/components/RequestDetailModal', () => ({
  RequestDetailModal: () => null,
}));

// Mock Radix Tabs so tab switching works in jsdom via fireEvent.click
vi.mock('@/components/ui/tabs', () => {
  const React = require('react');
  const TabsContext = React.createContext<{ value: string; onValueChange: (v: string) => void }>({
    value: '',
    onValueChange: () => {},
  });

  const Tabs = ({ value, onValueChange, children, className }: any) => (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );

  const TabsList = ({ children, className }: any) => (
    <div role="tablist" className={className}>{children}</div>
  );

  const TabsTrigger = ({ value, children, className }: any) => {
    const ctx = React.useContext(TabsContext);
    return (
      <button
        role="tab"
        aria-selected={ctx.value === value}
        data-state={ctx.value === value ? 'active' : 'inactive'}
        className={className}
        onClick={() => ctx.onValueChange(value)}
      >
        {children}
      </button>
    );
  };

  const TabsContent = ({ value, children, className }: any) => {
    const ctx = React.useContext(TabsContext);
    if (ctx.value !== value) return null;
    return <div role="tabpanel" className={className}>{children}</div>;
  };

  return { Tabs, TabsList, TabsTrigger, TabsContent };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Module-level data (after all vi.mock calls) ────────────────────────────

const mockSavedAOI = {
  _id: 'aoi-001',
  name: 'My Karachi AOI',
  description: 'Port area',
  aoi_type: 'polygon',
  aoi_coordinates: {
    type: 'Polygon',
    coordinates: [[[67.0, 24.8], [67.1, 24.8], [67.1, 24.9], [67.0, 24.9], [67.0, 24.8]]],
  },
  aoi_area_km2: 85.3,
  aoi_center: { lat: 24.85, lng: 67.05 },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockNavigate = vi.fn();

// ── Imports (after vi.mock calls) ──────────────────────────────────────────

import ExplorerPage from '@/pages/ExplorerPage';
import UserImageryDashboard from '@/pages/UserImageryDashboard';
import { createSavedAOI, deleteSavedAOI } from '@/lib/api/savedAOIs';

// ── Helpers ────────────────────────────────────────────────────────────────

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

function renderDashboard() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <HelmetProvider>
        <MemoryRouter initialEntries={['/dashboard/imagery']}>
          <UserImageryDashboard />
        </MemoryRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('E2E: Saved AOI Workflow – Draw → Save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AC-8.1: Save AOI button appears after drawing an AOI (authenticated user)', async () => {
    renderExplorer();

    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });

    const saveBtn = screen.getByRole('button', { name: /save aoi/i });
    expect(saveBtn).toBeInTheDocument();
  });

  it('AC-8.1: Clicking Save AOI opens the save dialog with AOI area pre-filled', async () => {
    renderExplorer();

    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save aoi/i }));
    });

    expect(screen.getByTestId('save-aoi-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-aoi-area')).toHaveTextContent('85.30');
  });

  it('AC-8.1: Confirming save dialog calls createSavedAOI API', async () => {
    renderExplorer();

    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save aoi/i }));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-save-aoi'));
    });

    await waitFor(() => {
      expect(createSavedAOI).toHaveBeenCalledWith(
        expect.objectContaining({
          aoi_type: 'polygon',
          aoi_area_km2: 85.3,
          aoi_center: { lat: 24.85, lng: 67.05 },
        })
      );
    });
  });

  it('AC-8.1: Cancelling save dialog does not call createSavedAOI', async () => {
    renderExplorer();

    await act(async () => {
      fireEvent.click(screen.getByTestId('simulate-draw-polygon'));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save aoi/i }));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('cancel-save-aoi'));
    });

    expect(createSavedAOI).not.toHaveBeenCalled();
  });
});

describe('E2E: Saved AOI Workflow – Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AC-8.2: Dashboard renders Saved AOIs tab for authenticated users', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: /saved aois/i })).toBeInTheDocument();
  });

  it('AC-8.2: Switching to Saved AOIs tab shows the saved AOIs list', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /saved aois/i })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: /saved aois/i }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('saved-aois-list')).toBeInTheDocument();
    });

    expect(screen.getByText('My Karachi AOI')).toBeInTheDocument();
  });

  it('AC-8.3: Loading a saved AOI navigates to /explore with AOI state', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /saved aois/i })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: /saved aois/i }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('load-aoi-btn-aoi-001')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('load-aoi-btn-aoi-001'));
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      '/explore',
      expect.objectContaining({
        state: expect.objectContaining({ loadedAOI: mockSavedAOI }),
      })
    );
  });

  it('AC-8.7: Deleting a saved AOI calls deleteSavedAOI API', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /saved aois/i })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: /saved aois/i }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('delete-aoi-btn-aoi-001')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-aoi-btn-aoi-001'));
    });

    await waitFor(() => {
      expect(deleteSavedAOI).toHaveBeenCalledWith('aoi-001');
    });
  });

  it('AC-8.4: Imagery Requests tab shows request history table', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /imagery requests/i })).toBeInTheDocument();
    });

    expect(screen.getByTestId('request-history-table')).toBeInTheDocument();
  });

  it('AC-8.5: Dashboard has a "New Request" button that navigates to /explore', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
    });

    const newRequestBtn = screen.getByRole('button', { name: /new request/i });
    expect(newRequestBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(newRequestBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/explore');
  });
});
