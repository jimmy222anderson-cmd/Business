# Task 16.2 Testing Guide - Cancel & Duplicate Request

## Bug Fix Applied

Fixed the "next is not a function" error in the ImageryRequest model's pre-save hook. The issue was that Mongoose 6+ doesn't require the `next` callback for synchronous pre-save hooks.

### Changes Made:
1. **backend/models/ImageryRequest.js**: Removed `next` parameter from pre-save hook
2. **backend/routes/user/imageryRequests.js**: Added `next` parameter to route handlers for proper error handling

## Testing Instructions

### Prerequisites
1. Backend server must be running on port 5000
2. You need a test user account
3. Test user should have at least one imagery request

### Automated Testing

Run the automated test script:

```bash
cd backend
node scripts/test-cancel-duplicate-simple.js
```

Update the credentials in the script if needed:
```javascript
const config = {
  host: 'localhost',
  port: 5000,
  email: 'test@example.com',  // Update this
  password: 'Test123!@#'       // Update this
};
```

### Manual Testing

#### Test 1: Cancel Request

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Log in to the application as a regular user

3. Navigate to Dashboard → Imagery Requests

4. Find a request with status "pending" or "reviewing"

5. Click "View Details" on the request

6. Click "Cancel Request" button

7. Verify:
   - ✅ Confirmation dialog appears
   - ✅ Can enter cancellation reason (optional)
   - ✅ Click "Cancel Request" to confirm
   - ✅ Success toast appears
   - ✅ Modal closes
   - ✅ Request list refreshes
   - ✅ Request status is now "cancelled"
   - ✅ Admin receives email notification

#### Test 2: Duplicate Request

1. From the Imagery Requests list, click "View Details" on any request

2. Click "Duplicate Request" button

3. Verify:
   - ✅ Redirected to Explorer page
   - ✅ AOI is drawn on the map
   - ✅ Filters are pre-filled (resolution, providers, etc.)
   - ✅ Request form opens with pre-filled data
   - ✅ Date range is populated
   - ✅ Urgency level is set
   - ✅ Additional requirements are filled (if any)

#### Test 3: Cancel Button Visibility

1. View requests with different statuses

2. Verify cancel button is:
   - ✅ Visible for "pending" requests
   - ✅ Visible for "reviewing" requests
   - ❌ Hidden for "quoted" requests
   - ❌ Hidden for "approved" requests
   - ❌ Hidden for "completed" requests
   - ❌ Hidden for "cancelled" requests

#### Test 4: Status History

1. Cancel a request

2. View the request details again

3. Verify:
   - ✅ Status timeline shows all status changes
   - ✅ Each status has a timestamp
   - ✅ Cancelled status is the most recent

## API Endpoints

### Cancel Request
```
POST /api/user/imagery-requests/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "cancellation_reason": "No longer needed"
}

Response (200):
{
  "message": "Imagery request cancelled successfully",
  "request": {
    "_id": "request_id",
    "status": "cancelled",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}

Error (400):
{
  "error": "Cannot cancel request",
  "message": "Requests with status \"approved\" cannot be cancelled...",
  "currentStatus": "approved",
  "cancellableStatuses": ["pending", "reviewing"]
}

Error (404):
{
  "error": "Not found",
  "message": "Imagery request not found or you do not have access to it"
}
```

### Get Request Details (for duplication)
```
GET /api/user/imagery-requests/:id
Authorization: Bearer <token>

Response (200):
{
  "request": {
    "_id": "request_id",
    "aoi_type": "polygon",
    "aoi_coordinates": {...},
    "aoi_area_km2": 100,
    "aoi_center": { "lat": 40.7128, "lng": -74.0060 },
    "date_range": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "filters": {
      "resolution_category": ["vhr", "high"],
      "max_cloud_coverage": 20,
      "providers": ["maxar", "planet"],
      "bands": ["rgb", "nir"],
      "image_types": ["optical"]
    },
    "urgency": "standard",
    "additional_requirements": "Need high resolution",
    "status": "pending",
    "status_history": [...]
  }
}
```

## Expected Behavior

### Cancel Request
- Only pending and reviewing requests can be cancelled
- User must confirm cancellation in dialog
- Cancellation reason is optional
- Admin receives email notification
- Status history is updated with cancellation
- Request list automatically refreshes

### Duplicate Request
- All request data is preserved except:
  - Request ID (new request will get new ID)
  - Status (will be "pending" for new request)
  - Timestamps (will be current time)
  - User contact info (will use current user's info)
- AOI geometry is preserved exactly
- All filters are preserved
- Date range is preserved (user can modify)

## Common Issues

### Cancel Request Issues

**Issue**: "next is not a function" error
- **Solution**: Fixed in ImageryRequest model pre-save hook

**Issue**: Black screen after clicking cancel
- **Solution**: Fixed Dialog component (was using AlertDialog incorrectly)

**Issue**: Email not sent
- **Check**: Email service configuration in .env
- **Check**: SALES_EMAIL environment variable

**Issue**: Cannot cancel request
- **Check**: Request status (must be pending or reviewing)
- **Check**: User owns the request

### Duplicate Request Issues

**Issue**: "Cannot read properties of undefined"
- **Solution**: Added optional chaining for filter transformations

**Issue**: AOI not drawn on map
- **Check**: aoi_coordinates format is correct
- **Check**: Map component is loaded

**Issue**: Filters not applied
- **Check**: Filter transformation from request format to FilterState format

## Success Criteria

✅ Cancel request works without errors
✅ Status updates to "cancelled"
✅ Status history tracks the change
✅ Admin receives email notification
✅ Duplicate request navigates to Explorer
✅ All request data is pre-filled correctly
✅ AOI is drawn on map
✅ Filters are applied
✅ User can modify and submit new request

## Next Steps

After testing is complete:
1. Remove console.log statements from production code
2. Update task status in tasks.md
3. Create completion document for Task 16.2
4. Move to Task 16.3 if needed
