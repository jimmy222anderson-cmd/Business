# Bugfix Requirements Document

## Introduction

This document addresses two critical bugs in the satellite imagery explorer's Area of Interest (AOI) display functionality:

1. **Area Calculation Discrepancy**: The "Area of Interest" card displays an incorrect area value (0.39 km²) that does not match the correct area shown in the "DRAW AN AREA" section (22.24 km²) for the same polygon.

2. **Incomplete Coordinate Display**: For polygons and triangles, only center coordinates are displayed instead of showing all vertex coordinates that define the shape.

These bugs impact the accuracy and completeness of spatial data presentation, potentially leading to incorrect analysis and decision-making based on AOI information.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a polygon is drawn and displayed in the "Area of Interest" card THEN the system displays an incorrect area value (e.g., 0.39 km² instead of 22.24 km²)

1.2 WHEN a polygon is drawn THEN the system displays only center coordinates (e.g., 22.0540, 72.7980) instead of all vertex coordinates

1.3 WHEN a triangle is drawn THEN the system displays only center coordinates instead of all three vertex coordinates

### Expected Behavior (Correct)

2.1 WHEN a polygon is drawn and displayed in the "Area of Interest" card THEN the system SHALL display the same area value as shown in the "DRAW AN AREA" section (e.g., 22.24 km²)

2.2 WHEN a polygon is drawn THEN the system SHALL display all vertex coordinates that define the polygon shape

2.3 WHEN a triangle is drawn THEN the system SHALL display all three vertex coordinates that define the triangle shape

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a circle or point is drawn THEN the system SHALL CONTINUE TO display center coordinates as currently implemented

3.2 WHEN the "DRAW AN AREA" section calculates and displays area THEN the system SHALL CONTINUE TO show the correct area calculation

3.3 WHEN any shape is drawn THEN the system SHALL CONTINUE TO display the AOI Type correctly

3.4 WHEN area calculations are performed in the "DRAW AN AREA" section THEN the system SHALL CONTINUE TO use the correct calculation method
