# Admin Satellite Products API

This document describes the admin API endpoints for managing satellite products.

## Authentication

All admin endpoints require:
1. Valid JWT token in Authorization header: `Authorization: Bearer <token>`
2. User must have `admin` role

## Endpoints

### GET /api/admin/satellite-products

Get all satellite products (including inactive ones).

**Query Parameters:**
- `status` (optional): Filter by status (`active` or `inactive`)
- `resolution_category` (optional): Filter by resolution category (`vhr`, `high`, `medium`, `low`)
- `sensor_type` (optional): Filter by sensor type (`optical`, `radar`, `thermal`)
- `availability` (optional): Filter by availability (`archive`, `tasking`, `both`)
- `provider` (optional): Filter by provider name (case-insensitive partial match)
- `sort` (optional): Sort field (`order`, `name`, `provider`, `resolution`, `created_at`, `updated_at`, `status`). Default: `order`
- `order` (optional): Sort order (`asc` or `desc`). Default: `asc`
- `page` (optional): Page number. Default: `1`
- `limit` (optional): Items per page (max 100). Default: `50`

**Response:**
```json
{
  "products": [
    {
      "_id": "...",
      "name": "Maxar WorldView-3",
      "provider": "Maxar Technologies",
      "sensor_type": "optical",
      "resolution": 0.31,
      "resolution_category": "vhr",
      "bands": ["RGB", "NIR", "Red-Edge"],
      "coverage": "Global",
      "availability": "both",
      "description": "...",
      "sample_image_url": "...",
      "specifications": {...},
      "pricing_info": "Contact for pricing",
      "status": "active",
      "order": 1,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

### GET /api/admin/satellite-products/:id

Get a single satellite product by ID.

**Response:**
```json
{
  "_id": "...",
  "name": "Maxar WorldView-3",
  ...
}
```

**Error Responses:**
- `400`: Invalid product ID format
- `404`: Product not found

### POST /api/admin/satellite-products

Create a new satellite product.

**Request Body:**
```json
{
  "name": "Test Satellite",
  "provider": "Test Provider",
  "sensor_type": "optical",
  "resolution": 0.5,
  "resolution_category": "vhr",
  "bands": ["RGB", "NIR"],
  "coverage": "Global",
  "availability": "both",
  "description": "Test satellite product",
  "sample_image_url": "/path/to/image.jpg",
  "specifications": {
    "swath_width": 13.1,
    "revisit_time": 1,
    "spectral_bands": 8,
    "radiometric_resolution": 11
  },
  "pricing_info": "Contact for pricing",
  "status": "active",
  "order": 10
}
```

**Required Fields:**
- `name`
- `provider`
- `sensor_type` (must be: `optical`, `radar`, or `thermal`)
- `resolution` (positive number)
- `resolution_category` (must be: `vhr`, `high`, `medium`, or `low`)
- `bands` (array with at least one item)
- `coverage`
- `availability` (must be: `archive`, `tasking`, or `both`)
- `description`

**Response:**
```json
{
  "_id": "...",
  "name": "Test Satellite",
  ...
}
```

**Error Responses:**
- `400`: Validation failed (with error details)

### PUT /api/admin/satellite-products/:id

Update an existing satellite product.

**Request Body:**
Same as POST, but all fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "_id": "...",
  "name": "Updated Satellite",
  ...
}
```

**Error Responses:**
- `400`: Invalid product ID format or validation failed
- `404`: Product not found

### DELETE /api/admin/satellite-products/:id

Delete a satellite product.

**Response:**
```json
{
  "message": "Satellite product deleted successfully",
  "deletedProduct": {
    "id": "...",
    "name": "Test Satellite"
  }
}
```

**Error Responses:**
- `400`: Invalid product ID format
- `404`: Product not found

## Testing

### Get Admin Token

First, get an admin token:

```bash
node scripts/get-admin-token.js
```

### Example Requests

Using curl (replace `<TOKEN>` with your admin token):

```bash
# Get all products
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/admin/satellite-products

# Get products with filters
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:5000/api/admin/satellite-products?status=active&resolution_category=vhr"

# Get single product
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/admin/satellite-products/<PRODUCT_ID>

# Create product
curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"Test","provider":"Test","sensor_type":"optical","resolution":1,"resolution_category":"high","bands":["RGB"],"coverage":"Global","availability":"archive","description":"Test"}' \
  http://localhost:5000/api/admin/satellite-products

# Update product
curl -X PUT -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"status":"inactive"}' \
  http://localhost:5000/api/admin/satellite-products/<PRODUCT_ID>

# Delete product
curl -X DELETE -H "Authorization: Bearer <TOKEN>" \
  http://localhost:5000/api/admin/satellite-products/<PRODUCT_ID>
```

## Implementation Details

- All routes require authentication (`requireAuth` middleware)
- All routes require admin role (`requireAdmin` middleware)
- MongoDB ObjectId validation is performed on ID parameters
- Validation errors return detailed error messages
- Pagination is implemented with configurable page size
- Multiple filter options can be combined
- Provider filter supports case-insensitive partial matching
