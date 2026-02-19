import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import L from 'leaflet';
import { MapContainer } from '@/components/MapContainer';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel, FilterState } from '@/components/FilterPanel';
import { RequestForm, AOIData } from '@/components/forms/RequestForm';
import { SaveAOIDialog } from '@/components/SaveAOIDialog';
import { SavedAOIsList } from '@/components/SavedAOIsList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, MapPin, Layers, Calendar, Search as SearchIcon, ArrowLeft, Filter, Save, BookmarkIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SavedAOI } from '@/lib/api/savedAOIs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface SearchResult {
  name: string;
  lat: number;
  lng: number;
  bbox?: [number, number, number, number];
}

interface SearchState {
  query: string;
  selectedLocation: SearchResult | null;
}

interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
}

export default function ExplorerPage() {
  const mapRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // AOI State Management
  const [currentAOI, setCurrentAOI] = useState<AOIData | null>(null);
  
  // Filter State Management
  const [filterState, setFilterState] = useState<FilterState | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Search State Management
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    selectedLocation: null,
  });
  
  // Request Form Visibility State
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  
  // Save AOI Dialog State
  const [isSaveAOIDialogOpen, setIsSaveAOIDialogOpen] = useState(false);
  
  // Saved AOIs Sheet State
  const [isSavedAOIsSheetOpen, setIsSavedAOIsSheetOpen] = useState(false);
  const [savedAOIsRefreshTrigger, setSavedAOIsRefreshTrigger] = useState(0);
  
  // Map State Management
  const [mapState, setMapState] = useState<MapState>({
    center: { lat: 20, lng: 0 },
    zoom: 2,
  });

  // State to hold AOI loaded from navigation
  const [pendingLoadedAOI, setPendingLoadedAOI] = useState<SavedAOI | null>(null);
  
  // State to hold duplicated request data
  const [pendingDuplicateRequest, setPendingDuplicateRequest] = useState<any>(null);
  const [duplicateRequestData, setDuplicateRequestData] = useState<any>(null);

  // Handle AOI loaded from navigation state (e.g., from dashboard)
  useEffect(() => {
    const state = location.state as { loadedAOI?: SavedAOI; duplicateRequest?: any };
    
    if (state?.loadedAOI) {
      setPendingLoadedAOI(state.loadedAOI);
    }
    
    if (state?.duplicateRequest) {
      setPendingDuplicateRequest(state.duplicateRequest);
    }
    
    // Clear the state to prevent reloading on subsequent renders
    if (state?.loadedAOI || state?.duplicateRequest) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Handler: Map Ready
  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  // Handler: Location Search and Selection
  const handleLocationSelect = useCallback((location: SearchResult) => {
    if (!mapRef.current) return;

    const { lat, lng, bbox } = location;

    // Update search state
    setSearchState({
      query: location.name,
      selectedLocation: location,
    });

    // If bbox is available, fit the map to the bounding box
    if (bbox && bbox.length === 4) {
      const bounds = L.latLngBounds(
        [bbox[1], bbox[0]], // southwest corner [south, west]
        [bbox[3], bbox[2]]  // northeast corner [north, east]
      );
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      });
      
      // Update map state with center of bounds
      const center = bounds.getCenter();
      setMapState({
        center: { lat: center.lat, lng: center.lng },
        zoom: mapRef.current.getZoom(),
      });
    } else {
      // Otherwise, center on the coordinates with appropriate zoom
      const zoom = 12; // Default zoom for cities/locations
      
      mapRef.current.setView([lat, lng], zoom, {
        animate: true,
        duration: 1,
      });
      
      // Update map state
      setMapState({
        center: { lat, lng },
        zoom,
      });
    }
  }, []);

  // Handler: AOI Changes (draw, edit, delete)
  const handleAOIChange = useCallback((aoi: AOIData | null) => {
    setCurrentAOI(aoi);
  }, []);

  // Handler: Filter Changes
  const handleFilterChange = useCallback((filters: FilterState) => {
    setFilterState(filters);
  }, []);

  // Handler: Submit Request Button
  const handleSubmitRequest = useCallback(() => {
    if (currentAOI) {
      setIsRequestFormOpen(true);
    }
  }, [currentAOI]);

  // Handler: Request Form Submission Success
  const handleRequestSubmitSuccess = useCallback(() => {
    // Optional: Clear AOI after successful submission
    // Uncomment the line below to enable automatic AOI clearing
    // setCurrentAOI(null);
  }, []);

  // Handler: Request Form Close
  const handleRequestFormClose = useCallback((open: boolean) => {
    setIsRequestFormOpen(open);
    // Clear duplicate request data when form closes
    if (!open) {
      setDuplicateRequestData(null);
    }
  }, []);

  // Handler: Save AOI Button
  const handleSaveAOI = useCallback(() => {
    if (currentAOI) {
      setIsSaveAOIDialogOpen(true);
    }
  }, [currentAOI]);

  // Handler: Save AOI Success
  const handleSaveAOISuccess = useCallback(() => {
    // Trigger refresh of saved AOIs list
    setSavedAOIsRefreshTrigger(prev => prev + 1);
  }, []);

  // Handler: Load Saved AOI
  const handleLoadSavedAOI = useCallback((aoi: SavedAOI) => {
    if (!mapRef.current) return;

    // Center map on AOI
    mapRef.current.setView([aoi.aoi_center.lat, aoi.aoi_center.lng], 12, {
      animate: true,
      duration: 1,
    });

    // Prepare AOI data for map to load
    const loadedAOIData = {
      type: aoi.aoi_type,
      coordinates: aoi.aoi_coordinates.coordinates,
      area: aoi.aoi_area_km2,
      center: aoi.aoi_center,
    };

    // Set as current AOI (MapContainer will handle drawing)
    setCurrentAOI({
      type: aoi.aoi_type,
      geoJSON: {
        type: 'Feature',
        properties: {},
        geometry: aoi.aoi_coordinates,
      },
      coordinates: aoi.aoi_coordinates.coordinates,
      area: aoi.aoi_area_km2,
      center: aoi.aoi_center,
      layer: null,
    });

    // Close the saved AOIs sheet
    setIsSavedAOIsSheetOpen(false);
  }, []);

  // Process pending loaded AOI when map is ready
  useEffect(() => {
    if (pendingLoadedAOI && mapRef.current) {
      // Small delay to ensure map is fully initialized
      const timer = setTimeout(() => {
        handleLoadSavedAOI(pendingLoadedAOI);
        setPendingLoadedAOI(null);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [pendingLoadedAOI, handleLoadSavedAOI]);

  // Process pending duplicate request when map is ready
  useEffect(() => {
    if (pendingDuplicateRequest && mapRef.current) {
      // Small delay to ensure map is fully initialized
      const timer = setTimeout(() => {
        // Set the AOI data
        setCurrentAOI({
          type: pendingDuplicateRequest.aoi_type,
          geoJSON: {
            type: 'Feature',
            properties: {},
            geometry: pendingDuplicateRequest.aoi_coordinates,
          },
          coordinates: pendingDuplicateRequest.aoi_coordinates.coordinates,
          area: pendingDuplicateRequest.aoi_area_km2,
          center: pendingDuplicateRequest.aoi_center,
          layer: null,
        });

        // Transform and set the filter state
        if (pendingDuplicateRequest.filters) {
          const filters = pendingDuplicateRequest.filters;
          setFilterState({
            selectedResolutions: filters.resolution_category || [],
            cloudCoverage: filters.max_cloud_coverage !== undefined ? filters.max_cloud_coverage : 100,
            selectedProviders: filters.providers || [],
            selectedBands: filters.bands || [],
            imageType: filters.image_types && filters.image_types.length > 0 ? filters.image_types[0] : null,
            dateRange: {
              startDate: pendingDuplicateRequest.date_range?.start_date ? new Date(pendingDuplicateRequest.date_range.start_date) : null,
              endDate: pendingDuplicateRequest.date_range?.end_date ? new Date(pendingDuplicateRequest.date_range.end_date) : null,
            }
          });
        }

        // Store the duplicate request data for the form
        setDuplicateRequestData({
          urgency: pendingDuplicateRequest.urgency,
          additional_requirements: pendingDuplicateRequest.additional_requirements,
          date_range: pendingDuplicateRequest.date_range,
        });

        // Center map on the AOI
        if (mapRef.current) {
          mapRef.current.setView(
            [pendingDuplicateRequest.aoi_center.lat, pendingDuplicateRequest.aoi_center.lng],
            10,
            { animate: true, duration: 1 }
          );
        }

        // Open the request form after a short delay
        setTimeout(() => {
          setIsRequestFormOpen(true);
        }, 500);

        setPendingDuplicateRequest(null);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [pendingDuplicateRequest]);

  return (
    <>
      <Helmet>
        <title>Platform Features | Earth Intelligence Platform</title>
        <meta 
          name="description" 
          content="Explore and request satellite imagery data with our interactive map. Define areas of interest, filter by resolution and sensor type, and submit custom imagery requests." 
        />
        <meta 
          name="keywords" 
          content="satellite imagery, earth observation, geospatial data, satellite data explorer, AOI selection, imagery request" 
        />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Platform Features | Earth Intelligence Platform" />
        <meta 
          property="og:description" 
          content="Explore and request satellite imagery data with our interactive map. Define areas of interest and submit custom imagery requests." 
        />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Platform Features | Earth Intelligence Platform" />
        <meta 
          name="twitter:description" 
          content="Explore and request satellite imagery data with our interactive map. Define areas of interest and submit custom imagery requests." 
        />
        
        {/* Additional SEO */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      
      <div className="h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Back to Website Button - Top Left */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-[997] bg-slate-900/95 backdrop-blur-sm border-slate-700 text-white hover:bg-slate-800 hover:border-yellow-500 shadow-lg md:top-4 md:left-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Back to Website</span>
        <span className="sm:hidden">Back</span>
      </Button>

      {/* Filter Panel - Collapsible Sidebar */}
      <FilterPanel 
        className="z-[999]"
        isOpen={isFilterPanelOpen}
        onOpenChange={setIsFilterPanelOpen}
        onFilterChange={handleFilterChange}
      />

      {/* Left Sidebar Panel - Responsive */}
      <div className="w-full md:w-80 lg:w-96 bg-slate-900 text-white flex flex-col shadow-2xl z-10 overflow-y-auto max-h-[40vh] md:max-h-none">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-700 flex-shrink-0 pt-16 md:pt-16">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h1 className="text-xl md:text-2xl font-bold">EXPLORE</h1>
            {/* Filter button - visible only on mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterPanelOpen(true)}
              className="bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {filterState && (
                (() => {
                  const count = 
                    (filterState.selectedResolutions?.length > 0 ? 1 : 0) +
                    (filterState.cloudCoverage !== undefined && filterState.cloudCoverage < 100 ? 1 : 0) +
                    (filterState.selectedProviders?.length > 0 ? 1 : 0) +
                    (filterState.selectedBands?.length > 0 ? 1 : 0) +
                    (filterState.imageType ? 1 : 0) +
                    (filterState.dateRange?.startDate || filterState.dateRange?.endDate ? 1 : 0);
                  return count > 0 ? (
                    <span className="ml-1 bg-yellow-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  ) : null;
                })()
              )}
            </Button>
          </div>
          <p className="text-xs md:text-sm text-slate-400">Search and request satellite imagery</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto sidebar-scrollable">
          {/* Search Section */}
          <div className="p-3 md:p-6 border-b border-slate-700">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <SearchIcon className="h-4 w-4 text-slate-400" />
              <h2 className="text-xs md:text-sm font-semibold text-slate-300">SEARCH LOCATION</h2>
            </div>
            <SearchBar 
              onLocationSelect={handleLocationSelect}
              placeholder="Search for a location..."
            />
          </div>

          {/* Draw Area Section */}
          <div className="p-3 md:p-6 border-b border-slate-700">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <MapPin className="h-4 w-4 text-slate-400" />
              <h2 className="text-xs md:text-sm font-semibold text-slate-300">DRAW AN AREA</h2>
            </div>
            <p className="text-xs text-slate-400 mb-3 md:mb-4">
              Use the drawing tools on the map to define your area of interest
            </p>
            
            {/* AOI Info Display */}
            {currentAOI ? (
              <Card className="bg-slate-800 border-slate-700 p-3 md:p-4">
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Type:</span>
                    <span className="text-xs md:text-sm font-medium capitalize">{currentAOI.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Area:</span>
                    <span className="text-xs md:text-sm font-medium text-yellow-400">
                      {currentAOI.area.toFixed(2)} km²
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Center:</span>
                    <span className="text-xs font-mono">
                      {currentAOI.center.lat.toFixed(4)}, {currentAOI.center.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                
                {/* Save AOI Button - Only for authenticated users */}
                {isAuthenticated && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveAOI}
                    className="w-full mt-3 bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-yellow-500 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save AOI
                  </Button>
                )}
              </Card>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 md:p-4 text-center">
                <p className="text-xs text-slate-400">No area selected</p>
              </div>
            )}
            
            {/* My Saved AOIs Button - Only for authenticated users */}
            {isAuthenticated && (
              <Sheet open={isSavedAOIsSheetOpen} onOpenChange={setIsSavedAOIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3 bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-yellow-500 text-white"
                  >
                    <BookmarkIcon className="mr-2 h-4 w-4" />
                    My Saved AOIs
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>My Saved AOIs</SheetTitle>
                    <SheetDescription>
                      Load previously saved areas of interest onto the map
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <SavedAOIsList 
                      onLoadAOI={handleLoadSavedAOI}
                      onRefresh={savedAOIsRefreshTrigger}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Data Type Section (Placeholder for future) - Hidden on mobile */}
          <div className="hidden md:block p-3 md:p-6 border-b border-slate-700">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Layers className="h-4 w-4 text-slate-400" />
              <h2 className="text-xs md:text-sm font-semibold text-slate-300">DATA TYPE</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white text-xs h-14 md:h-16 flex flex-col items-center justify-center"
              >
                <Layers className="h-4 w-4 md:h-5 md:w-5 mb-1" />
                <span>Optical</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white text-xs h-14 md:h-16 flex flex-col items-center justify-center"
              >
                <Layers className="h-4 w-4 md:h-5 md:w-5 mb-1" />
                <span>SAR</span>
              </Button>
            </div>
          </div>

          {/* Date Range Section (Placeholder for future) - Hidden on mobile */}
          <div className="hidden md:block p-3 md:p-6 border-b border-slate-700">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h2 className="text-xs md:text-sm font-semibold text-slate-300">DATE RANGE</h2>
            </div>
            <p className="text-xs text-slate-400">
              Select date range in the request form
            </p>
          </div>
        </div>

        {/* Submit Button - Fixed at bottom */}
        <div className="p-3 md:p-6 border-t border-slate-700 flex-shrink-0 bg-slate-900">
          <Button
            size="lg"
            onClick={handleSubmitRequest}
            disabled={!currentAOI}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base h-10 md:h-11"
          >
            <Send className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Submit Request
          </Button>
          {!currentAOI && (
            <p className="text-xs text-slate-400 text-center mt-2">
              Draw an area to enable request
            </p>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative min-h-[60vh] md:min-h-0">
        <MapContainer 
          onMapReady={handleMapReady}
          onAOIChange={handleAOIChange}
          loadedAOI={currentAOI ? {
            type: currentAOI.type,
            coordinates: currentAOI.coordinates,
            area: currentAOI.area,
            center: currentAOI.center,
          } : null}
        />
        
        {/* Total Search Area Badge (top center) - Responsive */}
        {currentAOI && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
            <Card className="bg-slate-900/95 backdrop-blur-sm border-yellow-500/50 px-3 py-2 md:px-6 md:py-3 shadow-xl">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-0.5 md:mb-1">Total Search Area</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-400">
                  {currentAOI.area.toFixed(2)} km²
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Request Form Modal */}
      <RequestForm
        open={isRequestFormOpen}
        onOpenChange={handleRequestFormClose}
        aoiData={currentAOI}
        filterState={filterState}
        onSubmitSuccess={handleRequestSubmitSuccess}
        duplicateRequestData={duplicateRequestData}
      />

      {/* Save AOI Dialog */}
      <SaveAOIDialog
        open={isSaveAOIDialogOpen}
        onOpenChange={setIsSaveAOIDialogOpen}
        aoiData={currentAOI}
        onSaveSuccess={handleSaveAOISuccess}
      />
    </div>
    </>
  );
}
