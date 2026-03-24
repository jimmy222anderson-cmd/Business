import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import './MapContainer.css'; // Mobile optimizations
import { useToast } from '@/hooks/use-toast';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Debounce utility function for performance optimization
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Utility function to calculate geodesic area in square meters
// Calculate geodesic area of a polygon using spherical excess formula
// Returns area in square kilometers
const calculateGeodesicArea = (latlngs: L.LatLng[]): number => {
  const earthRadius = 6371; // Earth's radius in kilometers
  
  if (latlngs.length < 3) return 0;
  
  let area = 0;
  const len = latlngs.length;
  
  for (let i = 0; i < len; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % len];
    
    // Convert to radians
    const lat1Rad = (p1.lat * Math.PI) / 180;
    const lat2Rad = (p2.lat * Math.PI) / 180;
    const lngDiff = ((p2.lng - p1.lng) * Math.PI) / 180;
    
    // Spherical excess formula
    area += lngDiff * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }
  
  area = Math.abs(area * earthRadius * earthRadius / 2);
  
  return parseFloat(area.toFixed(2));
};

// Utility function to calculate center point of a polygon
const calculateCenterPoint = (latlngs: L.LatLng[]): { lat: number; lng: number } => {
  if (latlngs.length === 0) return { lat: 0, lng: 0 };
  
  let latSum = 0;
  let lngSum = 0;
  
  latlngs.forEach((latlng) => {
    latSum += latlng.lat;
    lngSum += latlng.lng;
  });
  
  return {
    lat: latSum / latlngs.length,
    lng: lngSum / latlngs.length,
  };
};

// Utility function to optimize layer for touch interaction
const optimizeLayerForTouch = (layer: L.Layer, isMobile: boolean) => {
  if (!isMobile) return;
  
  // Increase weight for better touch interaction
  if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
    layer.setStyle({
      weight: 4, // Thicker lines for easier touch selection
    });
  }
  
  // Add touch-friendly event handlers
  layer.on('touchstart', (e: L.LeafletEvent) => {
    L.DomEvent.stopPropagation(e);
  });
};

interface MapContainerProps {
  onAOIChange?: (aoi: any) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: L.Map) => void;
  loadedAOI?: {
    type: string;
    coordinates: any;
    area: number;
    center: { lat: number; lng: number };
  } | null;
  uploadedGeometries?: any[] | null;
}

export const MapContainer = ({
  onAOIChange,
  initialCenter = { lat: 20, lng: 0 },
  initialZoom = 2,
  onMapReady,
  loadedAOI,
  uploadedGeometries,
}: MapContainerProps) => {
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const areaLabelRef = useRef<L.Popup | null>(null);
  const isMobileRef = useRef<boolean>(false);

  // Debounced AOI change handler for better performance during editing
  const debouncedAOIChange = useCallback(
    debounce((aoiData: any) => {
      if (onAOIChange) {
        onAOIChange(aoiData);
      }
    }, 100), // 100ms debounce for responsive feel
    [onAOIChange]
  );

  // Detect mobile device and update on resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      isMobileRef.current = mobile;
      
      // Invalidate map size on resize for proper rendering
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Detect if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    // Initialize Leaflet map with default view and mobile-optimized settings
    const map = L.map(containerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: initialZoom,
      zoomControl: false, // We'll add it in a custom position
      // Mobile optimizations
      tap: true, // Enable tap interactions
      tapTolerance: isMobile ? 20 : 15, // Larger tap tolerance for mobile (default is 15)
      touchZoom: true, // Enable pinch-to-zoom
      bounceAtZoomLimits: false, // Smoother zoom experience
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      // Performance optimizations
      preferCanvas: isMobile, // Use canvas renderer on mobile for better performance
      updateWhenIdle: isMobile, // Update map only when idle on mobile
      updateWhenZooming: !isMobile, // Disable updates during zoom on mobile for performance
      keepBuffer: isMobile ? 1 : 2, // Reduce buffer on mobile to save memory
    });

    mapRef.current = map;

    // Add base layer (OpenStreetMap tiles) with caching and performance optimizations
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      // Tile caching optimizations
      keepBuffer: isMobile ? 1 : 2, // Reduce buffer on mobile to save memory
      updateWhenIdle: isMobile, // Update tiles only when idle on mobile
      updateWhenZooming: !isMobile, // Disable updates during zoom on mobile
      // Performance optimizations
      crossOrigin: true, // Enable CORS for better caching
      // Browser will cache tiles automatically via HTTP headers
    }).addTo(map);

    // Add zoom controls (positioned top-right with mobile-friendly size)
    const zoomControl = L.control
      .zoom({
        position: 'topright',
      })
      .addTo(map);
    
    // Make zoom controls larger on mobile for better touch interaction
    if (isMobile) {
      const zoomElement = zoomControl.getContainer();
      if (zoomElement) {
        zoomElement.style.transform = 'scale(1.2)';
        zoomElement.style.transformOrigin = 'top right';
      }
    }

    // Add scale control (positioned bottom-left)
    L.control
      .scale({
        position: 'bottomleft',
        metric: true,
        imperial: false,
      })
      .addTo(map);

    // Initialize FeatureGroup to store drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Initialize Geoman drawing controls with mobile optimizations
    (map as any).pm.addControls({
      position: 'topright',
      drawPolygon: true,
      drawRectangle: true,
      drawCircle: false,
      drawCircleMarker: false,
      drawMarker: false,
      drawPolyline: false,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    });

    // Configure global options for drawing with mobile optimizations
    (map as any).pm.setGlobalOptions({
      pathOptions: {
        color: '#9333EA',
        fillColor: '#9333EA',
        fillOpacity: 0.2,
        weight: 3,
      },
      snappable: false,
      snapDistance: 20,
      // Mobile-specific drawing options
      templineStyle: {
        color: '#9333EA',
        weight: isMobile ? 3 : 2,
      },
      hintlineStyle: {
        color: '#9333EA',
        dashArray: [5, 5],
        weight: isMobile ? 2 : 1,
      },
      // Larger markers for touch interaction
      markerStyle: {
        draggable: true,
        icon: L.divIcon({
          className: 'custom-marker',
          iconSize: isMobile ? [16, 16] : [12, 12],
          html: `<div style="background-color: #9333EA; width: 100%; height: 100%; border-radius: 50%; border: 2px solid white;"></div>`,
        }),
      },
    });

    // Make drawing control buttons larger on mobile
    if (isMobile) {
      const pmControls = document.querySelector('.leaflet-pm-toolbar');
      if (pmControls) {
        (pmControls as HTMLElement).style.transform = 'scale(1.2)';
        (pmControls as HTMLElement).style.transformOrigin = 'top right';
      }
    }

    // Add mobile-specific touch optimizations
    if (isMobile) {
      // Prevent default touch behavior that might interfere with map interactions
      const mapContainer = containerRef.current;
      
      // Improve touch responsiveness
      mapContainer.addEventListener('touchstart', (e) => {
        // Allow single touch for panning, two touches for zooming
        if (e.touches.length === 1) {
          e.stopPropagation();
        }
      }, { passive: true });

      // Optimize vertex editing for touch
      map.on('pm:globaleditmodetoggled', (e: any) => {
        if (e.enabled) {
          // Make edit markers larger for touch
          const editMarkers = document.querySelectorAll('.leaflet-marker-icon.marker-icon-middle');
          editMarkers.forEach((marker) => {
            (marker as HTMLElement).style.width = '20px';
            (marker as HTMLElement).style.height = '20px';
            (marker as HTMLElement).style.marginLeft = '-10px';
            (marker as HTMLElement).style.marginTop = '-10px';
          });
        }
      });

      // Add haptic feedback for drawing actions (if supported)
      const triggerHaptic = () => {
        if ('vibrate' in navigator) {
          navigator.vibrate(10); // Short vibration for feedback
        }
      };

      map.on('pm:create', triggerHaptic);
      map.on('pm:remove', triggerHaptic);
      map.on('pm:vertexadded', triggerHaptic);
    }

    // Debounce map move events on mobile for better performance
    let moveTimeout: NodeJS.Timeout;
    if (isMobile) {
      map.on('move', () => {
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
          // Trigger any move-related updates here if needed
        }, 100);
      });
    }

    // Add "My Location" button for mobile users
    if (isMobile && 'geolocation' in navigator) {
      const LocationControl = L.Control.extend({
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
          container.innerHTML = `
            <a href="#" role="button" title="My Location" style="
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
              font-size: 20px;
              text-decoration: none;
              color: #333;
            ">📍</a>
          `;
          
          container.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 13, {
                  animate: true,
                  duration: 1,
                });
                
                // Add a temporary marker
                const marker = L.marker([latitude, longitude], {
                  icon: L.divIcon({
                    className: 'current-location-marker',
                    html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>',
                    iconSize: [16, 16],
                  }),
                }).addTo(map);
                
                // Remove marker after 3 seconds
                setTimeout(() => {
                  map.removeLayer(marker);
                }, 3000);
              },
              (error) => {
                console.error('Geolocation error:', error);
                toast({
                  title: 'Location Error',
                  description: 'Unable to get your current location. Please check your browser permissions.',
                  variant: 'destructive',
                });
              },
              {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
              }
            );
          };
          
          return container;
        },
      });
      
      new LocationControl({ position: 'topright' }).addTo(map);
    }

    // Notify parent that map is ready
    if (onMapReady) {
      onMapReady(map);
    }

    // Handle shape creation
    map.on('pm:create', (e: any) => {
      const layer = e.layer;
      
      // Optimize layer for touch interaction on mobile
      optimizeLayerForTouch(layer, isMobile);
      
      // Limit to one AOI at a time - clear existing shapes
      drawnItems.clearLayers();
      
      // Remove existing area label if any
      if (areaLabelRef.current) {
        map.removeLayer(areaLabelRef.current);
        areaLabelRef.current = null;
      }
      
      // Add the new shape
      drawnItems.addLayer(layer);

      // Get coordinates - handle both polygon and rectangle
      let latlngs: L.LatLng[];
      if (layer instanceof L.Rectangle) {
        const bounds = layer.getBounds();
        latlngs = [
          bounds.getSouthWest(),
          bounds.getNorthWest(),
          bounds.getNorthEast(),
          bounds.getSouthEast(),
        ];
      } else if (layer instanceof L.Polygon) {
        latlngs = layer.getLatLngs()[0] as L.LatLng[];
      } else {
        return;
      }
      
      // Calculate area in square kilometers
      const areaInKm2 = calculateGeodesicArea(latlngs);
      
      // Validate area is between 1 and 5000 km²
      if (areaInKm2 < 1) {
        toast({
          title: 'Area Too Small',
          description: 'The selected area must be at least 1 km². Please draw a larger area.',
          variant: 'destructive',
        });
        // Remove the invalid layer
        map.removeLayer(layer);
        return;
      }
      
      if (areaInKm2 > 5000) {
        toast({
          title: 'Area Too Large',
          description: 'The selected area must not exceed 5,000 km². Please draw a smaller area.',
          variant: 'destructive',
        });
        // Remove the invalid layer
        map.removeLayer(layer);
        return;
      }
      
      // Calculate center point
      const center = calculateCenterPoint(latlngs);
      
      // Area is displayed in the top panel, no need for tooltip on map
      // const areaLabel = L.popup({
      //   closeButton: false,
      //   autoClose: false,
      //   closeOnClick: false,
      //   className: 'aoi-area-label',
      // })
      //   .setLatLng([center.lat, center.lng])
      //   .setContent(`<div style="font-weight: bold; color: #9333EA;">Area: ${areaInKm2.toFixed(2)} km²</div>`)
      //   .openOn(map);
      
      // areaLabelRef.current = areaLabel;

      // Emit AOI data to parent component
      if (onAOIChange) {
        const geoJSON = layer.toGeoJSON();
        
        onAOIChange({
          type: e.shape.toLowerCase(), // Convert to lowercase for backend compatibility
          geoJSON,
          coordinates: geoJSON.geometry.coordinates,
          area: areaInKm2,
          center,
          layer,
        });
      }
    });

    // Handle shape editing with debouncing for better performance
    map.on('pm:edit', (e: any) => {
      const layer = e.layer;
      
      // Get coordinates - handle both polygon and rectangle
      let latlngs: L.LatLng[];
      if (layer instanceof L.Rectangle) {
        const bounds = layer.getBounds();
        latlngs = [
          bounds.getSouthWest(),
          bounds.getNorthWest(),
          bounds.getNorthEast(),
          bounds.getSouthEast(),
        ];
      } else if (layer instanceof L.Polygon) {
        latlngs = layer.getLatLngs()[0] as L.LatLng[];
      } else {
        return;
      }
      
      // Calculate area in square kilometers
      const areaInKm2 = calculateGeodesicArea(latlngs);
      
      // Validate area is between 1 and 5000 km²
      if (areaInKm2 < 1) {
        toast({
          title: 'Area Too Small',
          description: 'The edited area must be at least 1 km². Please make it larger.',
          variant: 'destructive',
        });
        // Revert the edit by removing and not updating
        return;
      }
      
      if (areaInKm2 > 5000) {
        toast({
          title: 'Area Too Large',
          description: 'The edited area must not exceed 5,000 km². Please make it smaller.',
          variant: 'destructive',
        });
        // Revert the edit by removing and not updating
        return;
      }
      
      // Calculate center point
      const center = calculateCenterPoint(latlngs);
      
      // Update area label
      if (areaLabelRef.current) {
        map.removeLayer(areaLabelRef.current);
      }
      
      // Area is displayed in the top panel, no need for tooltip on map
      // const areaLabel = L.popup({
      //   closeButton: false,
      //   autoClose: false,
      //   closeOnClick: false,
      //   className: 'aoi-area-label',
      // })
      //   .setLatLng([center.lat, center.lng])
      //   .setContent(`<div style="font-weight: bold; color: #9333EA;">Area: ${areaInKm2.toFixed(2)} km²</div>`)
      //   .openOn(map);
      
      // areaLabelRef.current = areaLabel;
      
      // Use debounced AOI change for better performance during editing
      const geoJSON = layer.toGeoJSON();
      debouncedAOIChange({
        type: layer instanceof L.Rectangle ? 'rectangle' : 'polygon', // Lowercase for backend
        geoJSON,
        coordinates: geoJSON.geometry.coordinates,
        area: areaInKm2,
        center,
        layer,
      });
    });

    // Handle shape removal
    map.on('pm:remove', () => {
      // Remove area label
      if (areaLabelRef.current && mapRef.current) {
        mapRef.current.removeLayer(areaLabelRef.current);
        areaLabelRef.current = null;
      }
      
      if (onAOIChange) {
        onAOIChange(null);
      }
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCenter.lat, initialCenter.lng, initialZoom, onAOIChange]);

  // Effect to load saved AOI
  useEffect(() => {
    if (!mapRef.current || !drawnItemsRef.current || !loadedAOI) return;

    const map = mapRef.current;
    const drawnItems = drawnItemsRef.current;

    // Validate loaded AOI area
    if (loadedAOI.area < 1) {
      toast({
        title: 'Invalid AOI',
        description: 'This saved AOI is too small (less than 1 km²) and cannot be loaded.',
        variant: 'destructive',
      });
      return;
    }
    
    if (loadedAOI.area > 5000) {
      toast({
        title: 'Invalid AOI',
        description: 'This saved AOI is too large (more than 5,000 km²) and cannot be loaded.',
        variant: 'destructive',
      });
      return;
    }

    // Clear existing shapes
    drawnItems.clearLayers();
    
    // Remove existing area label
    if (areaLabelRef.current) {
      map.removeLayer(areaLabelRef.current);
      areaLabelRef.current = null;
    }

    try {
      // Create layer from GeoJSON coordinates
      let layer: L.Layer;
      
      if (loadedAOI.type === 'polygon' || loadedAOI.type === 'rectangle') {
        // For Polygon type, coordinates are [[[lng, lat], ...]]
        const coords = loadedAOI.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
        layer = L.polygon(coords, {
          color: '#9333EA',
          fillColor: '#9333EA',
          fillOpacity: 0.2,
          weight: 3,
        });
      } else if (loadedAOI.type === 'circle') {
        // For circle, coordinates are [lng, lat] for center
        const center: [number, number] = [loadedAOI.coordinates[1], loadedAOI.coordinates[0]];
        // Calculate radius from area (approximate)
        const radiusInMeters = Math.sqrt(loadedAOI.area * 1000000 / Math.PI);
        layer = L.circle(center, {
          radius: radiusInMeters,
          color: '#9333EA',
          fillColor: '#9333EA',
          fillOpacity: 0.2,
          weight: 3,
        });
      } else {
        return;
      }

      // Add layer to map
      drawnItems.addLayer(layer);

      // Optimize layer for touch interaction on mobile
      optimizeLayerForTouch(layer, isMobileRef.current);

      // Enable editing for the layer
      if ((layer as any).pm) {
        (layer as any).pm.enable();
      }
      // Area is displayed in the top panel, no need for tooltip on map
      // const areaLabel = L.popup({
      //   closeButton: false,
      //   autoClose: false,
      //   closeOnClick: false,
      //   className: 'aoi-area-label',
      // })
      //   .setLatLng([loadedAOI.center.lat, loadedAOI.center.lng])
      //   .setContent(`<div style="font-weight: bold; color: #9333EA;">Area: ${loadedAOI.area.toFixed(2)} km²</div>`)
      //   .openOn(map);
      
      // areaLabelRef.current = areaLabel;

      // Notify parent of loaded AOI
      if (onAOIChange) {
        const geoJSON = (layer as any).toGeoJSON();
        onAOIChange({
          type: loadedAOI.type,
          geoJSON,
          coordinates: geoJSON.geometry.coordinates,
          area: loadedAOI.area,
          center: loadedAOI.center,
          layer,
        });
      }
    } catch (error) {
      console.error('Error loading saved AOI:', error);
    }
  }, [loadedAOI, onAOIChange]);

  // Effect to handle uploaded geometries
  useEffect(() => {
    if (!mapRef.current || !drawnItemsRef.current) return;

    const map = mapRef.current;
    const drawnItems = drawnItemsRef.current;

    // If uploadedGeometries is null or empty, clear the layers
    if (!uploadedGeometries || uploadedGeometries.length === 0) {
      drawnItems.clearLayers();
      
      // Remove existing area label
      if (areaLabelRef.current) {
        map.removeLayer(areaLabelRef.current);
        areaLabelRef.current = null;
      }
      
      return;
    }

    // Clear existing shapes
    drawnItems.clearLayers();
    
    // Remove existing area label
    if (areaLabelRef.current) {
      map.removeLayer(areaLabelRef.current);
      areaLabelRef.current = null;
    }

    try {
      // Use the first geometry from the uploaded file
      const geometry = uploadedGeometries[0];
      
      if (!geometry || !geometry.type || !geometry.coordinates) {
        toast({
          title: 'Invalid Geometry',
          description: 'The uploaded file contains invalid geometry data.',
          variant: 'destructive',
        });
        return;
      }

      let layer: L.Layer | null = null;
      let latlngs: L.LatLng[] = [];

      // Handle different geometry types
      if (geometry.type === 'Polygon') {
        // For Polygon, coordinates are [[[lng, lat], ...]]
        const coords = geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
        layer = L.polygon(coords, {
          color: '#9333EA',
          fillColor: '#9333EA',
          fillOpacity: 0.2,
          weight: 3,
        });
        latlngs = coords.map((coord: number[]) => L.latLng(coord[0], coord[1]));
      } else if (geometry.type === 'Point') {
        // For Point, coordinates are [lng, lat]
        const coords: [number, number] = [geometry.coordinates[1], geometry.coordinates[0]];
        layer = L.marker(coords);
        latlngs = [L.latLng(coords[0], coords[1])];
      } else if (geometry.type === 'LineString') {
        // For LineString, coordinates are [[lng, lat], ...]
        const coords = geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        layer = L.polyline(coords, {
          color: '#9333EA',
          weight: 3,
        });
        latlngs = coords.map((coord: number[]) => L.latLng(coord[0], coord[1]));
      } else if (geometry.type === 'MultiPolygon') {
        // For MultiPolygon, use the first polygon
        const coords = geometry.coordinates[0][0].map((coord: number[]) => [coord[1], coord[0]]);
        layer = L.polygon(coords, {
          color: '#9333EA',
          fillColor: '#9333EA',
          fillOpacity: 0.2,
          weight: 3,
        });
        latlngs = coords.map((coord: number[]) => L.latLng(coord[0], coord[1]));
      } else {
        toast({
          title: 'Unsupported Geometry Type',
          description: `Geometry type "${geometry.type}" is not supported. Please use Polygon, Point, or LineString.`,
          variant: 'destructive',
        });
        return;
      }

      if (!layer) return;

      // Add layer to map
      drawnItems.addLayer(layer);

      // Optimize layer for touch interaction on mobile
      optimizeLayerForTouch(layer, isMobileRef.current);

      // Enable editing for the layer (if it's a polygon)
      if ((layer as any).pm) {
        (layer as any).pm.enable();
      }

      // Calculate area and center for polygons
      if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
        const areaInKm2 = calculateGeodesicArea(latlngs);
        
        // Validate area
        if (areaInKm2 < 1) {
          toast({
            title: 'Area Too Small',
            description: 'The uploaded geometry area is less than 1 km². Please upload a larger area.',
            variant: 'destructive',
          });
          drawnItems.clearLayers();
          return;
        }
        
        if (areaInKm2 > 5000) {
          toast({
            title: 'Area Too Large',
            description: 'The uploaded geometry area exceeds 5,000 km². Please upload a smaller area.',
            variant: 'destructive',
          });
          drawnItems.clearLayers();
          return;
        }
        
        const center = calculateCenterPoint(latlngs);

        // Notify parent of uploaded AOI
        if (onAOIChange) {
          const geoJSON = (layer as any).toGeoJSON();
          onAOIChange({
            type: 'polygon',
            geoJSON,
            coordinates: geoJSON.geometry.coordinates,
            area: areaInKm2,
            center,
            layer,
          });
        }

        // Fit map to geometry bounds
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
        });
      } else {
        // For non-polygon geometries, just center the map
        if (latlngs.length > 0) {
          map.setView(latlngs[0], 12);
        }
      }

      toast({
        title: 'Geometry Loaded',
        description: `Successfully loaded ${geometry.type} from uploaded file.`,
      });
    } catch (error) {
      console.error('Error loading uploaded geometry:', error);
      toast({
        title: 'Error Loading Geometry',
        description: 'Failed to display the uploaded geometry on the map.',
        variant: 'destructive',
      });
    }
  }, [uploadedGeometries, onAOIChange, toast]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
};
