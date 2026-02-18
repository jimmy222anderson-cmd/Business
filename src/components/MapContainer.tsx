import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
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

// Utility function to calculate geodesic area in square meters
const calculateGeodesicArea = (latlngs: L.LatLng[]): number => {
  const earthRadius = 6378137; // Earth's radius in meters
  
  if (latlngs.length < 3) return 0;
  
  let area = 0;
  const len = latlngs.length;
  
  for (let i = 0; i < len; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % len];
    
    area += (p2.lng - p1.lng) * (2 + Math.sin(p1.lat * Math.PI / 180) + Math.sin(p2.lat * Math.PI / 180));
  }
  
  area = Math.abs(area * earthRadius * earthRadius / 2);
  
  return area;
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
}

export const MapContainer = ({
  onAOIChange,
  initialCenter = { lat: 20, lng: 0 },
  initialZoom = 2,
  onMapReady,
  loadedAOI,
}: MapContainerProps) => {
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const areaLabelRef = useRef<L.Popup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize Leaflet map with default view
    const map = L.map(containerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: initialZoom,
      zoomControl: false, // We'll add it in a custom position
    });

    mapRef.current = map;

    // Add base layer (OpenStreetMap tiles)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom controls (positioned top-right)
    L.control
      .zoom({
        position: 'topright',
      })
      .addTo(map);

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

    // Initialize Geoman drawing controls
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

    // Configure global options for drawing
    (map as any).pm.setGlobalOptions({
      pathOptions: {
        color: '#9333EA',
        fillColor: '#9333EA',
        fillOpacity: 0.2,
        weight: 3,
      },
      snappable: false,
      snapDistance: 20,
    });

    // Notify parent that map is ready
    if (onMapReady) {
      onMapReady(map);
    }

    // Handle shape creation
    map.on('pm:create', (e: any) => {
      const layer = e.layer;
      
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
      const areaInSquareMeters = calculateGeodesicArea(latlngs);
      const areaInKm2 = areaInSquareMeters / 1000000;
      
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

    // Handle shape editing
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
      const areaInSquareMeters = calculateGeodesicArea(latlngs);
      const areaInKm2 = areaInSquareMeters / 1000000;
      
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
      
      // Emit AOI data to parent component
      if (onAOIChange) {
        const geoJSON = layer.toGeoJSON();
        
        onAOIChange({
          type: layer instanceof L.Rectangle ? 'rectangle' : 'polygon', // Lowercase for backend
          geoJSON,
          coordinates: geoJSON.geometry.coordinates,
          area: areaInKm2,
          center,
          layer,
        });
      }
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

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
};
