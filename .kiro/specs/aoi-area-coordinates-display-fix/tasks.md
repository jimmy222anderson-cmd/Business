# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Fault Condition** - Area Calculation Consistency and Complete Vertex Display
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fix when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate both bugs exist
  - **Scoped PBT Approach**: Scope properties to concrete failing cases to ensure reproducibility
  - Test that frontend calculateGeodesicArea produces different area than backend for the same polygon coordinates (from Fault Condition in design)
  - Test that polygon/rectangle AOIs do not display vertex coordinates in ExplorerPage (only center is shown)
  - Test that polygon/rectangle AOIs do not display vertex coordinates in RequestForm (only center and bounding box shown)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found:
    - Expected: Frontend area differs significantly from backend area (e.g., 0.39 km² vs 22.24 km²)
    - Expected: Vertex coordinates exist in data but are not rendered in UI
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Circle/Point Display and Backend Calculation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Circle AOIs display only center coordinates
    - Point AOIs display only center coordinates
    - Backend calculateAreaFromCoordinates produces specific area values for test polygons
    - Bounding box display works correctly
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all circle AOIs, only center coordinates are displayed (not vertices)
    - For all point AOIs, only center coordinates are displayed
    - For all polygon coordinates, backend area calculation produces same results as before
    - Bounding box display remains unchanged
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 3. Fix for area calculation discrepancy and incomplete coordinate display

  - [x] 3.1 Fix area calculation in MapContainer.tsx
    - Update Earth radius constant from 6378137 (meters) to 6371 (kilometers)
    - Remove division by 1,000,000 since calculating directly in km²
    - Update return statement to use parseFloat(area.toFixed(2)) for consistent rounding
    - Update function comments to clarify it returns area in square kilometers directly
    - _Bug_Condition: isBugCondition_AreaCalculation(input) where input.aoiType IN ['polygon', 'rectangle']_
    - _Expected_Behavior: frontendArea matches backendArea within 0.01 km² tolerance (Property 1)_
    - _Preservation: Backend area calculation unchanged, circle/point display unchanged (Properties 3, 4)_
    - _Requirements: 2.1, 3.2, 3.4_

  - [x] 3.2 Add vertex coordinate display to ExplorerPage.tsx
    - Add conditional logic to check if currentAOI.type is 'polygon' or 'rectangle'
    - If true, display all vertex coordinates from currentAOI.coordinates[0]
    - Format vertices as "Vertex N: lat, lng" with 4 decimal precision
    - Add scrollable container for polygons with many vertices
    - If false (circle/point), continue displaying only center coordinates
    - _Bug_Condition: isBugCondition_CoordinateDisplay(input) where input.aoiType IN ['polygon', 'rectangle', 'triangle']_
    - _Expected_Behavior: All vertex coordinates displayed in clear, readable format (Property 2)_
    - _Preservation: Circle/point center-only display unchanged (Property 3)_
    - _Requirements: 2.2, 2.3, 3.1_

  - [x] 3.3 Add vertex coordinate display to RequestForm.tsx
    - Add conditional logic to check if aoiData.type is 'polygon' or 'rectangle'
    - Add new section after "Center Point" to display vertex coordinates
    - Display all vertex coordinates from aoiData.coordinates[0]
    - Use collapsible/expandable UI for better space management
    - Maintain existing bounding box display
    - _Bug_Condition: isBugCondition_CoordinateDisplay(input) where input.aoiType IN ['polygon', 'rectangle', 'triangle']_
    - _Expected_Behavior: All vertex coordinates displayed in clear, readable format (Property 2)_
    - _Preservation: Bounding box display unchanged (Property 4)_
    - _Requirements: 2.2, 2.3, 3.1_

  - [x] 3.4 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Area Calculation Consistency and Complete Vertex Display
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms bugs are fixed)
    - Verify frontend area calculation matches backend within 0.01 km² tolerance
    - Verify vertex coordinates are displayed for polygon/rectangle AOIs in both ExplorerPage and RequestForm
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Circle/Point Display and Backend Calculation
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm circle/point AOIs still display only center coordinates
    - Confirm backend area calculation produces identical results
    - Confirm bounding box display still works correctly
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise
  - Verify area calculation consistency across frontend and backend
  - Verify complete vertex coordinate display for polygons
  - Verify preservation of circle/point center-only display
  - Verify preservation of backend calculation logic
