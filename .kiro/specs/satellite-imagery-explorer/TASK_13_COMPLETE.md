# Task 13: Backend API - Saved AOIs - Complete

## Summary
Successfully implemented the backend API for managing saved AOIs (Areas of Interest) with full CRUD functionality, validation, and user limits.

## Completed Sub-tasks

### 13.1 Create saved AOI routes ✅
Created comprehensive REST API endpoints for saved AOIs:

**Endpoints Implemented:**
- `GET /api/user/saved-aois` - List user's saved AOIs with pagination, sorting, and search
- `GET /api/user/saved-aois/:id` - Get a single saved AOI by ID
- `POST /api/user/saved-aois` - Create a new saved AOI
- `PUT /api/user/saved-aois/:id` - Update AOI name and description
- `DELETE /api/user/saved-aois/:id` - Delete a saved AOI
- `PUT /api/user/saved-aois/:id/use` - Update last_used_at timestamp

**Features:**
- Pagination support (page, limit)
- Sorting by multiple fields (created_at, updated_at, name, last_used_at, aoi_area_km2)
- Search functionality (name and description)
- User-scoped queries (users can only access their own AOIs)
- Proper error handling with descriptive messages
- Development mode error details

### 13.2 Add AOI validation ✅
Implemented comprehensive validation at multiple levels:

**Coordinate Validation:**
- Validates GeoJSON structure (Polygon or Point type)
- Validates coordinate array format
- Ensures coordinates are numbers
- Validates coordinate pairs [lng, lat]

**Name Validation:**
- Required field
- Maximum length: 100 characters
- Trimmed whitespace
- Unique per user (enforced by database index and explicit checks)

**Description Validation:**
- Optional field
- Maximum length: 500 characters
- Trimmed whitespace

**User Limits:**
- Maximum 50 saved AOIs per user
- Returns clear error message when limit is reached
- Includes current count in error response

**Duplicate Prevention:**
- Unique compound index on (user_id, name)
- Explicit duplicate checks before create/update
- Clear error messages for duplicate names

## Files Created/Modified

### Created Files
- `backend/routes/user/savedAOIs.js` - Complete saved AOI routes implementation

### Modified Files
- `backend/server.js` - Added route registration for saved AOIs

## API Endpoints Documentation

### GET /api/user/saved-aois
List all saved AOIs for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `sort` (optional): Field to sort by (created_at, updated_at, name, last_used_at, aoi_area_km2)
- `order` (optional): Sort order (asc, desc) - default: desc
- `page` (optional): Page number - default: 1
- `limit` (optional): Items per page (1-100) - default: 20
- `search` (optional): Search in name and description

**Response:**
```json
{
  "aois": [
    {
      "_id": "string",
      "user_id": "string",
      "name": "string",
      "description": "string",
      "aoi_type": "polygon|rectangle|circle",
      "aoi_coordinates": {
        "type": "Polygon|Point",
        "coordinates": []
      },
      "aoi_area_km2": number,
      "aoi_center": {
        "lat": number,
        "lng": number
      },
      "last_used_at": "ISO date",
      "created_at": "ISO date",
      "updated_at": "ISO date"
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

### GET /api/user/saved-aois/:id
Get a single saved AOI by ID.

**Authentication:** Required

**Response:**
```json
{
  "aoi": {
    "_id": "string",
    "user_id": "string",
    "name": "string",
    "description": "string",
    "aoi_type": "polygon|rectangle|circle",
    "aoi_coordinates": {
      "type": "Polygon|Point",
      "coordinates": []
    },
    "aoi_area_km2": number,
    "aoi_center": {
      "lat": number,
      "lng": number
    },
    "last_used_at": "ISO date",
    "created_at": "ISO date",
    "updated_at": "ISO date"
  }
}
```

### POST /api/user/saved-aois
Create a new saved AOI.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (required, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "aoi_type": "polygon|rectangle|circle (required)",
  "aoi_coordinates": {
    "type": "Polygon|Point (required)",
    "coordinates": "array (required)"
  },
  "aoi_area_km2": "number (required, positive)",
  "aoi_center": {
    "lat": "number (required, -90 to 90)",
    "lng": "number (required, -180 to 180)"
  }
}
```

**Response (201 Created):**
```json
{
  "message": "AOI saved successfully",
  "aoi": { /* saved AOI object */ }
}
```

**Error Responses:**
- 400: Validation error, duplicate name, or limit reached
- 401: Unauthorized
- 500: Server error

### PUT /api/user/saved-aois/:id
Update a saved AOI's name and/or description.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (optional, max 100 chars)",
  "description": "string (optional, max 500 chars)"
}
```

**Response:**
```json
{
  "message": "AOI updated successfully",
  "aoi": { /* updated AOI object */ }
}
```

### DELETE /api/user/saved-aois/:id
Delete a saved AOI.

**Authentication:** Required

**Response:**
```json
{
  "message": "AOI deleted successfully",
  "deletedAOI": {
    "id": "string",
    "name": "string"
  }
}
```

### PUT /api/user/saved-aois/:id/use
Update the last_used_at timestamp when an AOI is loaded.

**Authentication:** Required

**Response:**
```json
{
  "message": "AOI usage updated",
  "aoi": { /* updated AOI object */ }
}
```

## Validation Rules

### Name Validation
- **Required**: Yes
- **Type**: String
- **Max Length**: 100 characters
- **Unique**: Per user
- **Trimmed**: Yes

### Description Validation
- **Required**: No
- **Type**: String
- **Max Length**: 500 characters
- **Trimmed**: Yes

### AOI Type Validation
- **Required**: Yes
- **Allowed Values**: polygon, rectangle, circle

### Coordinates Validation
- **Required**: Yes
- **Type**: GeoJSON (Polygon or Point)
- **Format**: Array of coordinate pairs [lng, lat]
- **Validation**: Ensures proper structure and numeric values

### Area Validation
- **Required**: Yes
- **Type**: Number
- **Min Value**: 0 (positive)

### Center Validation
- **Required**: Yes
- **Latitude**: -90 to 90
- **Longitude**: -180 to 180

### User Limits
- **Max Saved AOIs**: 50 per user
- **Error Message**: Clear indication of limit and current count

## Error Handling

### Validation Errors (400)
Returns detailed validation errors for each field:
```json
{
  "error": "Validation error",
  "details": {
    "name": "AOI name is required",
    "aoi_area_km2": "AOI area must be positive"
  }
}
```

### Duplicate Name Error (400)
```json
{
  "error": "Duplicate name",
  "message": "You already have a saved AOI with this name. Please choose a different name."
}
```

### Limit Reached Error (400)
```json
{
  "error": "Limit reached",
  "message": "You can only save up to 50 AOIs. Please delete some before adding new ones.",
  "maxLimit": 50,
  "currentCount": 50
}
```

### Not Found Error (404)
```json
{
  "error": "Not found",
  "message": "Saved AOI not found"
}
```

### Server Error (500)
```json
{
  "error": "Failed to save AOI",
  "message": "Error details (development mode only)"
}
```

## Database Schema

The SavedAOI model (already existed) includes:

**Fields:**
- `user_id`: Reference to UserProfile (required, indexed)
- `name`: String (required, max 100 chars, unique per user)
- `description`: String (optional, max 500 chars)
- `aoi_type`: Enum (polygon, rectangle, circle)
- `aoi_coordinates`: GeoJSON (Polygon or Point)
- `aoi_area_km2`: Number (positive)
- `aoi_center`: Object with lat/lng
- `last_used_at`: Date (tracks when AOI was last loaded)
- `created_at`: Date (auto-generated)
- `updated_at`: Date (auto-generated)

**Indexes:**
- `{ user_id: 1, created_at: -1 }` - List user's AOIs by date
- `{ user_id: 1, name: 1 }` - Search by name
- `{ user_id: 1, last_used_at: -1 }` - Sort by usage
- `{ user_id: 1, name: 1 }` (unique) - Prevent duplicate names
- `{ aoi_coordinates: '2dsphere' }` - Geospatial queries

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **User Scoping**: Users can only access their own saved AOIs
3. **Input Validation**: All inputs are validated before processing
4. **SQL Injection Prevention**: Using Mongoose parameterized queries
5. **XSS Prevention**: Input trimming and validation
6. **Rate Limiting**: Inherits from global rate limiting middleware

## Testing Checklist

- [ ] Test GET /api/user/saved-aois with pagination
- [ ] Test GET /api/user/saved-aois with sorting
- [ ] Test GET /api/user/saved-aois with search
- [ ] Test GET /api/user/saved-aois/:id
- [ ] Test POST /api/user/saved-aois with valid data
- [ ] Test POST /api/user/saved-aois with duplicate name
- [ ] Test POST /api/user/saved-aois when limit reached
- [ ] Test PUT /api/user/saved-aois/:id
- [ ] Test DELETE /api/user/saved-aois/:id
- [ ] Test PUT /api/user/saved-aois/:id/use
- [ ] Test authentication requirement
- [ ] Test user scoping (can't access other users' AOIs)
- [ ] Test coordinate validation
- [ ] Test name length validation
- [ ] Test description length validation

## Next Steps

The backend API for saved AOIs is complete. Next tasks:

1. **Task 14**: Frontend - Saved AOIs
   - Create UI components for saving and managing AOIs
   - Integrate with the backend API
   - Add save/load functionality to the map

2. **Task 15**: Frontend - User Dashboard
   - Create user dashboard page
   - Display saved AOIs list
   - Show request history

## Notes

- The SavedAOI model was already created in Task 1.3
- All validation rules are enforced at both the model level and route level
- The API follows RESTful conventions
- Error messages are user-friendly and actionable
- The implementation supports future features like geospatial queries
- The last_used_at field enables sorting by recently used AOIs
