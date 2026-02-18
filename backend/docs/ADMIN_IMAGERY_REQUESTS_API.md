# Admin Imagery Requests API Documentation

## Overview
This API allows administrators to view, filter, and manage all imagery requests submitted by users. Admins can update request status, add notes, and provide quotes.

## Authentication
All endpoints require:
- Valid JWT token in Authorization header
- Admin role

```
Authorization: Bearer <admin_jwt_token>
```

## Endpoints

### 1. Get All Imagery Requests

**GET** `/api/admin/imagery-requests`

Retrieve all imagery requests with optional filtering, sorting, and pagination.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| status | string | Filter by status (pending, reviewing, quoted, approved, completed, cancelled) | - |
| urgency | string | Filter by urgency (standard, urgent, emergency) | - |
| user_id | string | Filter by user ID | - |
| email | string | Filter by email (case-insensitive partial match) | - |
| date_from | string | Filter by created date (ISO format: YYYY-MM-DD) | - |
| date_to | string | Filter by created date (ISO format: YYYY-MM-DD) | - |
| sort | string | Sort field (created_at, updated_at, status, urgency, aoi_area_km2, full_name, email) | created_at |
| order | string | Sort order (asc, desc) | desc |
| page | number | Page number | 1 |
| limit | number | Items per page (max 100) | 20 |

#### Example Request

```bash
curl -X GET "http://localhost:5000/api/admin/imagery-requests?status=pending&urgency=urgent&page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

#### Example Response

```json
{
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user_id": {
        "_id": "507f1f77bcf86cd799439012",
        "full_name": "John Doe",
        "email": "john@example.com",
        "company": "Acme Corp"
      },
      "full_name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "phone": "+1234567890",
      "aoi_type": "polygon",
      "aoi_coordinates": {
        "type": "Polygon",
        "coordinates": [[[74.0, 31.0], [74.5, 31.0], [74.5, 31.5], [74.0, 31.5], [74.0, 31.0]]]
      },
      "aoi_area_km2": 2642.59,
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
        "bands": ["RGB", "NIR"],
        "image_types": ["optical"]
      },
      "urgency": "urgent",
      "additional_requirements": "Need high resolution imagery for analysis",
      "status": "pending",
      "admin_notes": null,
      "quote_amount": null,
      "quote_currency": "USD",
      "reviewed_at": null,
      "reviewed_by": null,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### 2. Get Single Imagery Request

**GET** `/api/admin/imagery-requests/:id`

Retrieve detailed information about a specific imagery request.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Imagery request ID |

#### Example Request

```bash
curl -X GET "http://localhost:5000/api/admin/imagery-requests/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <admin_token>"
```

#### Example Response

```json
{
  "request": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": {
      "_id": "507f1f77bcf86cd799439012",
      "full_name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "phone": "+1234567890"
    },
    "full_name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "phone": "+1234567890",
    "aoi_type": "polygon",
    "aoi_coordinates": {
      "type": "Polygon",
      "coordinates": [[[74.0, 31.0], [74.5, 31.0], [74.5, 31.5], [74.0, 31.5], [74.0, 31.0]]]
    },
    "aoi_area_km2": 2642.59,
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
      "bands": ["RGB", "NIR"],
      "image_types": ["optical"]
    },
    "urgency": "urgent",
    "additional_requirements": "Need high resolution imagery for analysis",
    "status": "pending",
    "admin_notes": null,
    "quote_amount": null,
    "quote_currency": "USD",
    "reviewed_at": null,
    "reviewed_by": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3. Update Imagery Request

**PUT** `/api/admin/imagery-requests/:id`

Update the status, add admin notes, or provide a quote for an imagery request.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Imagery request ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | No | New status (pending, reviewing, quoted, approved, completed, cancelled) |
| admin_notes | string | No | Admin notes about the request |
| quote_amount | number | No | Quote amount (must be positive) |
| quote_currency | string | No | Quote currency (e.g., USD, EUR, GBP) |

#### Example Request

```bash
curl -X PUT "http://localhost:5000/api/admin/imagery-requests/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "quoted",
    "admin_notes": "Quote prepared based on AOI size and requirements",
    "quote_amount": 5000,
    "quote_currency": "USD"
  }'
```

#### Example Response

```json
{
  "message": "Imagery request updated successfully",
  "request": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": {
      "_id": "507f1f77bcf86cd799439012",
      "full_name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp"
    },
    "full_name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "phone": "+1234567890",
    "aoi_type": "polygon",
    "aoi_coordinates": {
      "type": "Polygon",
      "coordinates": [[[74.0, 31.0], [74.5, 31.0], [74.5, 31.5], [74.0, 31.5], [74.0, 31.0]]]
    },
    "aoi_area_km2": 2642.59,
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
      "bands": ["RGB", "NIR"],
      "image_types": ["optical"]
    },
    "urgency": "urgent",
    "additional_requirements": "Need high resolution imagery for analysis",
    "status": "quoted",
    "admin_notes": "Quote prepared based on AOI size and requirements",
    "quote_amount": 5000,
    "quote_currency": "USD",
    "reviewed_at": "2024-01-15T14:30:00.000Z",
    "reviewed_by": {
      "_id": "507f1f77bcf86cd799439013",
      "full_name": "Admin User",
      "email": "admin@example.com"
    },
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

---

## Status Workflow

The typical workflow for imagery request statuses:

1. **pending** - Initial status when request is submitted
2. **reviewing** - Admin is reviewing the request
3. **quoted** - Quote has been provided to the user
4. **approved** - Request has been approved and is being processed
5. **completed** - Imagery has been delivered
6. **cancelled** - Request was cancelled

---

## Error Responses

### 400 Bad Request

Invalid input data or validation error.

```json
{
  "error": "Invalid status",
  "message": "Status must be one of: pending, reviewing, quoted, approved, completed, cancelled",
  "validStatuses": ["pending", "reviewing", "quoted", "approved", "completed", "cancelled"]
}
```

### 401 Unauthorized

Missing or invalid authentication token.

```json
{
  "error": "Unauthorized",
  "message": "No token provided"
}
```

### 403 Forbidden

User does not have admin privileges.

```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

### 404 Not Found

Imagery request not found.

```json
{
  "error": "Not found",
  "message": "Imagery request not found"
}
```

### 500 Internal Server Error

Server error occurred.

```json
{
  "error": "Failed to fetch imagery requests",
  "message": "Database connection error"
}
```

---

## Testing

A test script is available to verify all endpoints:

```bash
cd backend
node scripts/test-admin-imagery-requests.js
```

The test script will:
1. Connect to MongoDB and obtain an admin token
2. Create a test imagery request
3. Test all GET endpoints with various filters
4. Test the PUT endpoint with status updates and quotes
5. Test error handling (invalid status, missing auth)
6. Verify date range filtering and sorting

---

## Notes

- All endpoints require admin authentication
- The `reviewed_at` and `reviewed_by` fields are automatically set when updating a request
- Quote currency is automatically converted to uppercase
- Date filters use the request's `created_at` field
- Pagination is limited to a maximum of 100 items per page
- User information is populated in responses when available
- Admin notes are only visible to admins (not exposed in user endpoints)

---

## Future Enhancements (Task 3.4)

- Email notifications to users when status changes
- Email notifications to admins when new requests are submitted
- Webhook support for status updates
- Export functionality for request data
