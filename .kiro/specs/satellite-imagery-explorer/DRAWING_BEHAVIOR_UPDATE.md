# Drawing Behavior Update

## Current Status

### Polygon Drawing
- **Expected**: Accept multiple points (4, 5, 6+ vertices)
- **How it works**: 
  - Click to add each vertex
  - Continue clicking to add more points
  - **To finish**: Double-click on the last point OR click on the first point to close the polygon
  - **Important**: Don't double-click until you've added all the points you want

### Rectangle Drawing  
- **Current behavior**: Click-and-drag (Leaflet.draw default)
- **User requirement**: Click-to-click (two separate clicks)
- **Issue**: Leaflet.draw's rectangle tool is hardcoded to use click-and-drag

## Solutions Attempted

1. ✅ Added `metric: true` to enable proper measurements
2. ✅ Changed all colors from yellow (#EAB308) to purple (#9333EA)
3. ❌ Custom rectangle handler - too complex and might break other functionality

## Recommended Approach

### Option 1: Keep Current Behavior (Simplest)
- Rectangle: Click-and-drag (standard Leaflet.draw behavior)
- Polygon: Multiple clicks + double-click to finish
- Update user documentation to match actual behavior

### Option 2: Switch to Leaflet-Geoman (Better UX)
- Install `@geoman-io/leaflet-geoman-free` library
- Provides click-to-click rectangle drawing
- Better mobile support
- More modern and actively maintained
- **Requires**: Replacing Leaflet.draw with Geoman

### Option 3: Custom Implementation
- Build custom rectangle handler from scratch
- Complex and error-prone
- Maintenance burden

## Current Implementation

The application currently uses:
- **Library**: Leaflet.draw
- **Rectangle**: Click-and-drag (cannot be changed without major refactoring)
- **Polygon**: Click for each vertex, double-click to finish

## User Instructions

### Drawing a Polygon (Multiple Points)
1. Click the polygon tool button
2. Click on the map to add the first vertex
3. Click again to add the second vertex
4. Click again to add the third vertex
5. **Keep clicking** to add as many vertices as you need (4, 5, 6, 7, etc.)
6. When you have all the points you want, **double-click** on the last point to finish
7. OR click on the first point to close the polygon

**Important**: The polygon will only finish when you double-click or click the first point. Single clicks will keep adding vertices.

### Drawing a Rectangle (Click-and-Drag)
1. Click the rectangle tool button
2. Click and **hold** the mouse button at one corner
3. **Drag** the mouse to the opposite corner (you'll see a preview)
4. **Release** the mouse button to complete the rectangle

## Next Steps

If you want click-to-click rectangle behavior, we need to:
1. Install Leaflet-Geoman: `npm install @geoman-io/leaflet-geoman-free --legacy-peer-deps`
2. Replace Leaflet.draw imports and configuration
3. Update all drawing event handlers
4. Test thoroughly

This would be a significant change but would provide better UX.
