# Imagery Request API Documentation

## Overview
The Imagery Request API allows users to submit requests for satellite imagery by defining an Area of Interest (AOI), specifying date ranges, and applying various filters.

## Endpoint

### POST /api/public/imagery-requests

Submit a new imagery request.

**Authentication:** Optional (if authenticated, user_id will be linked)

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "company": "Test Company",
  "phone": "+1-234-567-8900",
  "aoi_type": "polygon",
  "aoi_coordinates": {
    "type": "Polygon",
    "coordinates": [[
      [-122.4194, 37.7749],
      [-122.4194, 37.8049],
      [-122.3894, 37.8049],
      [-122.3894, 37.7749],
      [-122.4194, 37.7749]
    ]]
  },
  "aoi_area_km2": 10.5,
  "aoi_center": {
    "lat": 37.7899,
    "lng": -122.4044
  },
  "date_range": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  "filters": {
    "resolution_category": ["vhr", "high"],
    "max_cloud_coverage": 20,
    "providers": ["Maxar", "Planet Labs"],
    "bands": ["RGB", "NIR"],
    "image_types": ["optical"]
  },
  "urgency": "standard",
  "additional_requirements": "Need high-quality imagery for urban planning analysis"
}
```

**Required Fields:**
- `full_name` (string, 1-100 characters)
- `email` (string, valid email format)
- `aoi_type` (string, one of: "polygon", "rectangle", "circle")
- `aoi_coordinates` (object, GeoJSON format)
- `aoi_center` (object with lat/lng)
- `date_range` (object with start_date and end_date)

**Optional Fields:**
- `company` (string, max 200 characters)
- `phone` (string, valid phone format)
- `aoi_area_km2` (number, will be calculated if not provided)
- `filters` (object)
- `urgency` (string, one of: "standard", "urgent", "emergency", default: "standard")
- `additional_requirements` (string, max 5000 characters)

**Success Response (201 Created):**
```json
{
  "message": "Imagery request submitted successfully",
  "request_id": "6994194a22cb358cf65071fb",
  "request": {
    "id": "6994194a22cb358cf65071fb",
    "status": "pending",
    "aoi_area_km2": 8.79,
    "created_at": "2026-02-17T07:31:22.156Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Validation error",
  "details": {
    "full_name": "Full name is required",
    "email": "Please provide a valid email address"
  }
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to submit imagery request",
  "message": "Error details (only in development mode)"
}
```

## Field Specifications

### AOI Coordinates
Must be in GeoJSON format:

**Polygon:**
```json
{
  "type": "Polygon",
  "coordinates": [[
    [lng1, lat1],
    [lng2, lat2],
    [lng3, lat3],
    [lng4, lat4],
    [lng1, lat1]
  ]]
}
```

**Point (for circle center):**
```json
{
  "type": "Point",
  "coordinates": [lng, lat]
}
```

**Coordinate Constraints:**
- Longitude: -180 to 180
- Latitude: -90 to 90
- Polygon must have at least 4 points (first and last must be the same)

### AOI Center
```json
{
  "lat": 37.7899,
  "lng": -122.4044
}
```

### Date Range
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```
- Dates must be in ISO 8601 format
- End date must be after or equal to start date

### Filters
All filter fields are optional:

```json
{
  "resolution_category": ["vhr", "high", "medium", "low"],
  "max_cloud_coverage": 20,
  "providers": ["Maxar", "Planet Labs"],
  "bands": ["RGB", "NIR", "Red-Edge"],
  "image_types": ["optical", "radar", "thermal"]
}
```

**Filter Constraints:**
- `resolution_category`: Array of strings (vhr, high, medium, low)
- `max_cloud_coverage`: Number between 0 and 100
- `providers`: Array of strings
- `bands`: Array of strings
- `image_types`: Array of strings (optical, radar, thermal)

### Urgency Levels
- `standard`: Normal processing (default)
- `urgent`: Expedited processing
- `emergency`: Highest priority

## Area Calculation

The API automatically calculates the area of the AOI from the provided coordinates using the Shoelace formula with spherical approximation. If `aoi_area_km2` is provided, it will be validated against the calculated area (warning logged if difference > 10%).

**Area Calculation Features:**
- Uses Earth's radius (6371 km) for accurate calculations
- Handles polygons of any size
- Returns area in square kilometers (km²)
- Precision: 2 decimal places

## Validation

The API performs comprehensive validation:

1. **Contact Information:**
   - Full name: Required, 1-100 characters
   - Email: Required, valid email format
   - Company: Optional, max 200 characters
   - Phone: Optional, valid phone format

2. **AOI Data:**
   - Type: Required, must be polygon/rectangle/circle
   - Coordinates: Required, valid GeoJSON format
   - Center: Required, valid lat/lng within bounds
   - Area: Optional, positive number

3. **Date Range:**
   - Both dates required
   - Valid date format
   - End date >= start date

4. **Filters:**
   - Valid enum values for categories
   - Cloud coverage: 0-100
   - Arrays for multi-select fields

5. **Additional Fields:**
   - Urgency: Valid enum value
   - Requirements: Max 5000 characters

## Testing

Test scripts are available in `backend/scripts/`:

1. **test-imagery-request-simple.js** - Full API endpoint tests
2. **test-coordinate-validation.js** - Geo utility function tests
3. **verify-imagery-request.js** - Database verification

Run tests:
```bash
node scripts/test-imagery-request-simple.js
node scripts/test-coordinate-validation.js
```

## Database Schema

Requests are stored in the `ImageryRequest` collection with the following structure:

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (null for guest users),
  full_name: String,
  email: String,
  company: String,
  phone: String,
  aoi_type: String,
  aoi_coordinates: {
    type: String,
    coordinates: Mixed
  },
  aoi_area_km2: Number,
  aoi_center: {
    lat: Number,
    lng: Number
  },
  date_range: {
    start_date: Date,
    end_date: Date
  },
  filters: {
    resolution_category: [String],
    max_cloud_coverage: Number,
    providers: [String],
    bands: [String],
    image_types: [String]
  },
  urgency: String,
  additional_requirements: String,
  status: String (default: 'pending'),
  admin_notes: String,
  quote_amount: Number,
  quote_currency: String,
  created_at: Date,
  updated_at: Date,
  reviewed_at: Date,
  reviewed_by: ObjectId
}
```

## Future Enhancements (Task 3.4)

- Email confirmation to user on request submission
- Email notification to admin on new request
- Integration with existing email service

## Related Files

- **Route:** `backend/routes/public/imageryRequests.js`
- **Model:** `backend/models/ImageryRequest.js`
- **Validation:** `backend/middleware/validation.js`
- **Utilities:** `backend/utils/geoUtils.js`
- **Tests:** `backend/scripts/test-imagery-request-simple.js`

## Example Usage

### cURL Example
```bash
curl -X POST http://localhost:5000/api/public/imagery-requests \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "aoi_type": "polygon",
    "aoi_coordinates": {
      "type": "Polygon",
      "coordinates": [[
        [-122.4194, 37.7749],
        [-122.4194, 37.8049],
        [-122.3894, 37.8049],
        [-122.3894, 37.7749],
        [-122.4194, 37.7749]
      ]]
    },
    "aoi_center": {
      "lat": 37.7899,
      "lng": -122.4044
    },
    "date_range": {
      "start_date": "2024-01-01",
      "end_date": "2024-12-31"
    },
    "urgency": "standard"
  }'
```

### JavaScript Example
```javascript
const response = await fetch('http://localhost:5000/api/public/imagery-requests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    aoi_type: 'polygon',
    aoi_coordinates: {
      type: 'Polygon',
      coordinates: [[
        [-122.4194, 37.7749],
        [-122.4194, 37.8049],
        [-122.3894, 37.8049],
        [-122.3894, 37.7749],
        [-122.4194, 37.7749]
      ]]
    },
    aoi_center: {
      lat: 37.7899,
      lng: -122.4044
    },
    date_range: {
      start_date: '2024-01-01',
      end_date: '2024-12-31'
    },
    urgency: 'standard'
  })
});

const data = await response.json();
console.log('Request ID:', data.request_id);
```
