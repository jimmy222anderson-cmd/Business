/**
 * Map Performance Optimization Utilities
 * 
 * This module provides utilities for optimizing map performance including:
 * - Tile caching strategies
 * - Event debouncing
 * - Feature limiting
 * - Memory management
 */

/**
 * Debounce function for optimizing frequent event handlers
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for limiting function execution rate
 * @param func - Function to throttle
 * @param limit - Minimum time between executions in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Get optimal tile layer configuration based on device capabilities
 * @param isMobile - Whether the device is mobile
 * @returns Tile layer configuration object
 */
export const getTileLayerConfig = (isMobile: boolean) => ({
  maxZoom: 19,
  // Tile caching optimizations
  keepBuffer: isMobile ? 1 : 2, // Reduce buffer on mobile to save memory
  updateWhenIdle: isMobile, // Update tiles only when idle on mobile
  updateWhenZooming: !isMobile, // Disable updates during zoom on mobile
  // Performance optimizations
  crossOrigin: true, // Enable CORS for better caching
  // Browser will cache tiles automatically via HTTP headers
});

/**
 * Get optimal map configuration based on device capabilities
 * @param isMobile - Whether the device is mobile
 * @returns Map configuration object
 */
export const getMapConfig = (isMobile: boolean) => ({
  zoomControl: false, // We'll add it in a custom position
  // Mobile optimizations
  tap: true, // Enable tap interactions
  tapTolerance: isMobile ? 20 : 15, // Larger tap tolerance for mobile
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

/**
 * Detect if the current device is mobile
 * @returns Boolean indicating if device is mobile
 */
export const isMobileDevice = (): boolean => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768
  );
};

/**
 * Calculate optimal debounce delay based on operation type
 * @param operationType - Type of operation (draw, edit, move, etc.)
 * @returns Optimal debounce delay in milliseconds
 */
export const getOptimalDebounceDelay = (
  operationType: 'draw' | 'edit' | 'move' | 'zoom'
): number => {
  const delays = {
    draw: 0, // No debounce for draw completion
    edit: 100, // 100ms for editing (responsive feel)
    move: 150, // 150ms for map movement
    zoom: 200, // 200ms for zoom operations
  };
  return delays[operationType];
};

/**
 * Limit the number of features on the map for performance
 * @param maxFeatures - Maximum number of features allowed
 * @returns Function to check if feature limit is reached
 */
export const createFeatureLimiter = (maxFeatures: number = 1) => {
  let featureCount = 0;
  
  return {
    canAddFeature: () => featureCount < maxFeatures,
    incrementCount: () => featureCount++,
    decrementCount: () => featureCount = Math.max(0, featureCount - 1),
    resetCount: () => featureCount = 0,
    getCount: () => featureCount,
  };
};

/**
 * Optimize layer rendering for touch devices
 * @param layer - Leaflet layer to optimize
 * @param isMobile - Whether the device is mobile
 */
export const optimizeLayerForTouch = (layer: any, isMobile: boolean): void => {
  if (!isMobile) return;
  
  // Increase weight for better touch interaction
  if (layer.setStyle) {
    layer.setStyle({
      weight: 4, // Thicker lines for easier touch selection
    });
  }
  
  // Add touch-friendly event handlers
  if (layer.on) {
    layer.on('touchstart', (e: any) => {
      if (e.originalEvent) {
        e.originalEvent.stopPropagation();
      }
    });
  }
};

/**
 * Clear tile cache (useful for memory management)
 * Note: This is a placeholder as Leaflet handles caching internally
 */
export const clearTileCache = (): void => {
  // Leaflet manages tile caching internally via browser cache
  // This function is a placeholder for future custom caching implementation
  console.log('Tile cache management is handled by the browser');
};

/**
 * Get memory-efficient drawing options
 * @param isMobile - Whether the device is mobile
 * @returns Drawing options object
 */
export const getDrawingOptions = (isMobile: boolean) => ({
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
});
