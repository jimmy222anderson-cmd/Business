# User Imagery Requests API

## Overview
This API allows authenticated users to view their own imagery requests.

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### GET /api/user/imagery-requests
Get a list of the authenticated user's imagery requests.

**Query Parameters:**
- `status` (optional): Filter by request status (pending, reviewing, quoted, approved, completed, cancelled)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)

**Response:**
```json
{
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user_id": "507f1f77bcf86cd799439012",
      "full_name": "John Doe",
      "email": "john@example.com",
      "company": "Example Corp",
      "phone": "+1234567890",
      "aoi_type": "polygon",
      "aoi_coordinates": {
        "type": "Polygon",
        "coordinates": [[[74.0, 31.0], [74.5, 31.0], [74.5, 31.5], [74.0, 31.5], [74.0, 31.0]]]
      },
      "aoi_area_km2": 3000,
      "aoi_center": {
        "lat": 31.25,
        "lng": 74.25
      },
      "date_range": {
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-12-31T00:00:00.000Z"
      },
      "filters": {
        "resolution_category": ["vhr", "high"],
        "max_cloud_coverage": 20,
        "providers": ["Maxar"],
        "bands": [],
        "image_types": ["optical"]
      },
      "urgency": "standard",
      "additional_requirements": "Need high resolution imagery",
      "status": "pending",
      "quote_amount": null,
      "quote_currency": "USD",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Status Codes:**
- `200 OK`: Successfully retrieved requests
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

**Example:**
```bash
curl -X GET "http://localhost:3000/api/user/imagery-requests?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

### GET /api/user/imagery-requests/:id
Get details of a specific imagery request.

**Path Parameters:**
- `id` (required): The imagery request ID

**Response:**
```json
{
  "request": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": "507f1f77bcf86cd799439012",
    "full_name": "John Doe",
    "email": "john@example.com",
    "company": "Example Corp",
    "phone": "+1234567890",
    "aoi_type": "polygon",
    "aoi_coordinates": {
      "type": "Polygon",
      "coordinates": [[[74.0, 31.0], [74.5, 31.0], [74.5, 31.5], [74.0, 31.5], [74.0, 31.0]]]
    },
    "aoi_area_km2": 3000,
    "aoi_center": {
      "lat": 31.25,
      "lng": 74.25
    },
    "date_range": {
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-12-31T00:00:00.000Z"
    },
    "filters": {
      "resolution_category": ["vhr", "high"],
      "max_cloud_coverage": 20,
      "providers": ["Maxar"],
      "bands": [],
      "image_types": ["optical"]
    },
    "urgency": "standard",
    "additional_requirements": "Need high resolution imagery",
    "status": "pending",
    "quote_amount": null,
    "quote_currency": "USD",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK`: Successfully retrieved request
- `400 Bad Request`: Invalid request ID format
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Request not found or user doesn't have access
- `500 Internal Server Error`: Server error

**Example:**
```bash
curl -X GET "http://localhost:3000/api/user/imagery-requests/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>"
```

---

## Security Notes

1. **Authentication Required**: All endpoints require a valid JWT token
2. **User Isolation**: Users can only access their own imagery requests
3. **Admin Fields Hidden**: Admin-only fields (`admin_notes`, `reviewed_by`) are not exposed to users
4. **Ownership Verification**: The API verifies that the authenticated user owns the requested imagery request

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common error scenarios:
- Missing authentication token → 401 Unauthorized
- Invalid token → 401 Unauthorized
- Expired token → 401 Unauthorized
- Request not found → 404 Not Found
- Invalid request ID → 400 Bad Request
- Server error → 500 Internal Server Error

## Testing

A test script is available at `backend/scripts/test-user-imagery-requests.js`.

To run the tests:
1. Ensure the backend server is running
2. Set up test user credentials in `.env`:
   ```
   TEST_USER_EMAIL=test@example.com
   TEST_USER_PASSWORD=testpassword123
   ```
3. Run the test script:
   ```bash
   node scripts/test-user-imagery-requests.js
   ```

The test script covers:
- Unauthorized access attempts
- User authentication
- Fetching user's imagery requests
- Pagination
- Status filtering
- Fetching single request
- Error handling (non-existent ID, invalid ID)
- Admin field exclusion verification
