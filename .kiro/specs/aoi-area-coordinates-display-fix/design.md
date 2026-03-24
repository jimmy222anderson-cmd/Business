# AOI Area and Coordinates Display Bugfix Design

## Overview

This design addresses two critical bugs in the satellite imagery explorer's Area of Interest (AOI) display functionality:

1. **Area Calculation Discrepancy**: The frontend MapContainer component uses a different area calculation method than the backend, resulting in incorrect area values being displayed in the "Area of Interest" card. The frontend calculates area in square meters then converts to km², while the backend calculates directly in km². Both use similar spherical excess formulas, but the frontend's implementation has a scaling issue.

2. **Incomplete Coordinate Display**: The ExplorerPage and RequestForm components only display center coordinates for all AOI types, including polygons and triangles. Users need to see all vertex coordinates for these shapes to understand the exact boundaries of their selected area.

The fix will standardize area calculation across frontend and backend, and enhance coordinate display to show all vertices for polygon-based shapes while maintaining center-only display for circles and points.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bugs - when a polygon/rectangle is drawn or when coordinate display is requested
- **Property (P)**: The desired behavior - accurate area calculation matching backend and complete vertex coordinate display for polygons
- **Preservation**: Existing circle/point center coordinate display and correct backend area calculation that must remain unchanged
- **calculateGeodesicArea**: The function in `src/components/MapContainer.tsx` that calculates polygon area using spherical excess formula
- **calculateAreaFromCoordinates**: The function in `backend/utils/geoUtils.js` that calculates polygon area (correct implementation)
- **currentAOI**: The state object in ExplorerPage containing AOI data (type, area, center, coordinates)
- **aoiData**: The prop passed to RequestForm containing AOI information

## Bug Details

### Fault Condition

**Bug 1: Area Calculation Discrepancy**

The bug manifests when a polygon or rectangle is drawn on the map. The `calculateGeodesicArea` function in MapContainer.tsx calculates area in square meters using Earth's radius in meters (6378137), then divides by 1,000,000 to convert to km². However, the backend's `calculateAreaFromCoordinates` function uses Earth's radius in kilometers (6371) and calculates directly in km². This results in different area values for the same polygon.

**Formal Specification:**
```
FUNCTION isBugCondition_AreaCalculation(input)
  INPUT: input of type { aoiType: string, coordinates: number[][][] }
  OUTPUT: boolean
  
  RETURN input.aoiType IN ['polygon', 'rectangle']
         AND input.coordinates is valid polygon coordinates
         AND frontendCalculatedArea != backendCalculatedArea
END FUNCTION
```

**Bug 2: Incomplete Coordinate Display**

The bug manifests when a polygon or triangle is drawn and the user views the AOI information. The ExplorerPage component only displays `currentAOI.center` coordinates, and the RequestForm component only shows center point and bounding box, but neither displays the actual vertex coordinates that define the polygon shape.

**Formal Specification:**
```
FUNCTION isBugCondition_CoordinateDisplay(input)
  INPUT: input of type { aoiType: string, coordinates: number[][][] }
  OUTPUT: boolean
  
  RETURN input.aoiType IN ['polygon', 'rectangle', 'triangle']
         AND vertexCoordinates exist in input.coordinates
         AND vertexCoordinates are NOT displayed to user
END FUNCTION
```

### Examples

**Bug 1 Examples:**
- User draws a polygon with area 22.24 km² (as calculated by backend)
- Frontend displays 0.39 km² in the "Area of Interest" card
- Backend recalculates and stores 22.24 km² when request is submitted
- User sees inconsistent area values between frontend display and backend confirmation

**Bug 2 Examples:**
- User draws a polygon with 5 vertices at coordinates: [[72.7, 22.0], [72.8, 22.0], [72.8, 22.1], [72.7, 22.1], [72.7, 22.0]]
- ExplorerPage displays only: "Center: 22.0540, 72.7980"
- User cannot see the actual boundary coordinates
- RequestForm shows bounding box but not the specific vertex coordinates

**Edge Cases:**
- Circle or point AOI should continue to display only center coordinates (not affected by these bugs)
- Very small polygons (near 1 km² minimum) should display accurate area
- Very large polygons (near 5000 km² maximum) should display accurate area

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Backend area calculation in `backend/utils/geoUtils.js` must continue to work exactly as before (it is correct)
- Circle and point AOI types must continue to display only center coordinates
- Area validation (1-5000 km² range) must continue to work
- Bounding box calculation and display must remain unchanged
- All other AOI functionality (drawing, editing, saving, loading) must remain unchanged

**Scope:**
All inputs that do NOT involve polygon/rectangle area calculation or polygon coordinate display should be completely unaffected by this fix. This includes:
- Circle AOI area calculation and display
- Point AOI coordinate display
- Backend area calculation logic
- AOI editing and removal functionality
- Map drawing controls and interactions

## Hypothesized Root Cause

Based on the code analysis, the root causes are:

1. **Inconsistent Earth Radius Units**: The frontend uses Earth's radius in meters (6378137) and converts the result, while the backend uses Earth's radius in kilometers (6371). This creates a scaling discrepancy in the final area calculation.

2. **Missing Coordinate Display Logic**: The ExplorerPage and RequestForm components were designed to show only center coordinates, which is appropriate for circles and points but insufficient for polygons. There is no conditional logic to display vertex coordinates for polygon-based shapes.

3. **UI Design Gap**: The original design did not account for the need to display multiple vertex coordinates for polygons, focusing only on center point display.

## Correctness Properties

Property 1: Fault Condition - Area Calculation Consistency

_For any_ polygon or rectangle AOI where coordinates are provided, the frontend calculateGeodesicArea function SHALL produce the same area value (within 0.01 km² tolerance) as the backend calculateAreaFromCoordinates function, ensuring consistent area display across the application.

**Validates: Requirements 2.1**

Property 2: Fault Condition - Complete Vertex Coordinate Display

_For any_ polygon or rectangle AOI where vertex coordinates exist, the UI SHALL display all vertex coordinates in a clear, readable format, allowing users to see the exact boundaries of their selected area.

**Validates: Requirements 2.2, 2.3**

Property 3: Preservation - Circle and Point Coordinate Display

_For any_ circle or point AOI, the UI SHALL continue to display only center coordinates as currently implemented, preserving the existing behavior for non-polygon shapes.

**Validates: Requirements 3.1**

Property 4: Preservation - Backend Area Calculation

_For any_ polygon coordinates processed by the backend, the calculateAreaFromCoordinates function SHALL produce the same results as before the fix, preserving the correct backend calculation logic.

**Validates: Requirements 3.2, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `src/components/MapContainer.tsx`

**Function**: `calculateGeodesicArea`

**Specific Changes**:
1. **Update Earth Radius Constant**: Change `earthRadius` from `6378137` (meters) to `6371` (kilometers) to match the backend implementation
   - Line 23: `const earthRadius = 6371; // Earth's radius in kilometers`
   - Remove the division by 1,000,000 since we're now calculating directly in km²

2. **Update Area Calculation**: Modify the return statement to match backend precision
   - Return `parseFloat(area.toFixed(2))` to ensure consistent rounding with backend

3. **Update Comments**: Update the function comment to clarify it returns area in square kilometers directly

**File 2**: `src/pages/ExplorerPage.tsx`

**Component**: AOI Info Display section (around line 442-480)

**Specific Changes**:
1. **Add Conditional Coordinate Display**: Add logic to display vertex coordinates for polygons/rectangles
   - Check if `currentAOI.type` is 'polygon' or 'rectangle'
   - If true, display all vertex coordinates from `currentAOI.coordinates[0]`
   - If false (circle/point), continue displaying only center coordinates

2. **Format Vertex Coordinates**: Display vertices in a scrollable list with proper formatting
   - Show each vertex as "Vertex N: lat, lng"
   - Limit display height with scrolling for polygons with many vertices
   - Use consistent decimal precision (4 digits) matching center coordinate display

**File 3**: `src/components/forms/RequestForm.tsx`

**Component**: Area of Interest Summary card (around line 350-400)

**Specific Changes**:
1. **Add Vertex Coordinates Section**: Add a new section after "Center Point" to display vertices
   - Check if `aoiData.type` is 'polygon' or 'rectangle'
   - Display all vertex coordinates from `aoiData.coordinates[0]`
   - Use collapsible/expandable UI for better space management

2. **Maintain Bounding Box Display**: Keep the existing bounding box display as it provides useful summary information

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that compare frontend and backend area calculations for the same polygon coordinates, and verify that vertex coordinates are not displayed in the UI. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Area Calculation Discrepancy Test**: Create a polygon with known coordinates, calculate area using both frontend and backend methods (will fail on unfixed code - values will differ significantly)
2. **Small Polygon Area Test**: Test with a polygon near 1 km² minimum to see if discrepancy is consistent (will fail on unfixed code)
3. **Large Polygon Area Test**: Test with a polygon near 5000 km² maximum to see if discrepancy scales (will fail on unfixed code)
4. **Coordinate Display Test**: Render ExplorerPage with polygon AOI and verify vertex coordinates are not shown (will fail on unfixed code - only center shown)
5. **RequestForm Coordinate Test**: Render RequestForm with polygon AOI and verify vertex coordinates are not shown (will fail on unfixed code - only center and bounding box shown)

**Expected Counterexamples**:
- Frontend calculates 0.39 km² while backend calculates 22.24 km² for the same polygon
- Possible causes: different Earth radius values, different unit conversions, different formula implementations
- Vertex coordinates exist in data structure but are not rendered in UI
- Possible causes: missing conditional logic, UI design focused only on center coordinates

### Fix Checking

**Goal**: Verify that for all inputs where the bug conditions hold, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL polygon WHERE isBugCondition_AreaCalculation(polygon) DO
  frontendArea := calculateGeodesicArea_fixed(polygon.coordinates)
  backendArea := calculateAreaFromCoordinates(polygon.coordinates)
  ASSERT abs(frontendArea - backendArea) < 0.01
END FOR

FOR ALL polygon WHERE isBugCondition_CoordinateDisplay(polygon) DO
  renderedUI := renderAOIDisplay_fixed(polygon)
  ASSERT renderedUI contains all vertex coordinates from polygon.coordinates[0]
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL aoi WHERE aoi.type IN ['circle', 'point'] DO
  ASSERT renderAOIDisplay_original(aoi) = renderAOIDisplay_fixed(aoi)
END FOR

FOR ALL coordinates WHERE backend processes coordinates DO
  ASSERT calculateAreaFromCoordinates_original(coordinates) = calculateAreaFromCoordinates_fixed(coordinates)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for circle/point AOIs and backend calculations, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Circle Coordinate Display Preservation**: Verify circle AOIs continue to show only center coordinates after fix
2. **Point Coordinate Display Preservation**: Verify point AOIs continue to show only center coordinates after fix
3. **Backend Area Calculation Preservation**: Verify backend area calculation produces identical results before and after fix
4. **Bounding Box Display Preservation**: Verify bounding box continues to display correctly after adding vertex coordinates

### Unit Tests

- Test `calculateGeodesicArea` with known polygon coordinates and verify it matches backend calculation
- Test area calculation for polygons at boundary conditions (1 km², 5000 km²)
- Test coordinate display rendering for polygon, rectangle, circle, and point AOI types
- Test that vertex coordinates are formatted correctly with proper decimal precision
- Test that UI handles polygons with many vertices (10+) gracefully with scrolling

### Property-Based Tests

- Generate random valid polygon coordinates and verify frontend and backend area calculations match within tolerance
- Generate random polygon coordinates and verify all vertices are displayed in UI
- Generate random circle/point AOIs and verify only center coordinates are displayed
- Test that area calculation is consistent across different polygon sizes and shapes

### Integration Tests

- Test full flow: draw polygon → verify area matches backend → submit request → verify stored area is correct
- Test loading saved polygon AOI and verifying area and coordinates display correctly
- Test uploading polygon from file and verifying area and coordinates display correctly
- Test editing polygon and verifying area recalculation and coordinate updates work correctly
