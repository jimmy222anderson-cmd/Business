# Imagery Request Export Functionality

## Overview
The export functionality allows administrators to export imagery request data as CSV files with filtering capabilities.

## Backend Implementation

### Endpoint
```
GET /api/admin/imagery-requests/export
```

### Authentication
- Requires valid JWT token
- Requires admin role

### Query Parameters
All parameters are optional and can be combined:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by request status | `pending`, `reviewing`, `quoted`, `approved`, `completed`, `cancelled` |
| `urgency` | string | Filter by urgency level | `standard`, `urgent`, `emergency` |
| `date_from` | date | Start date for created_at filter (ISO format) | `2024-01-01` |
| `date_to` | date | End date for created_at filter (ISO format) | `2024-12-31` |
| `user_id` | string | Filter by user ID | MongoDB ObjectId |
| `email` | string | Filter by email (case-insensitive regex) | `user@example.com` |

### Response
- **Content-Type**: `text/csv`
- **Content-Disposition**: `attachment; filename="imagery-requests-YYYY-MM-DD.csv"`
- Returns CSV file with all matching imagery requests

### CSV Structure
The exported CSV includes the following columns:

1. Request ID
2. Status
3. Urgency
4. Full Name
5. Email
6. Company
7. Phone
8. AOI Type
9. AOI Area (km²)
10. AOI Center Lat
11. AOI Center Lng
12. Date Range Start
13. Date Range End
14. Resolution Categories
15. Max Cloud Coverage (%)
16. Providers
17. Bands
18. Image Types
19. Additional Requirements
20. Quote Amount
21. Quote Currency
22. Admin Notes
23. Created At
24. Updated At
25. Reviewed At
26. Reviewed By

### CSV Formatting
- Values containing commas, newlines, or quotes are wrapped in double quotes
- Double quotes within values are escaped as `""`
- Array values (resolution categories, providers, bands, image types) are joined with `;` separator
- Dates are formatted as ISO strings
- Empty values are represented as empty strings

## Frontend Implementation

### Location
`src/pages/admin/ImageryRequestsPage.tsx`

### Export Button
- Located in the page header next to the title
- Styled with yellow background (brand color)
- Shows download icon

### Functionality
1. Collects current filter values from the page state
2. Builds query parameters from active filters
3. Makes authenticated GET request to export endpoint
4. Receives CSV blob from response
5. Creates temporary download link
6. Triggers browser download
7. Cleans up temporary resources
8. Shows success/error toast notification

### Filter Integration
The export respects the following filters from the UI:
- Status filter dropdown
- Urgency filter dropdown
- Date from input
- Date to input
- Search query (mapped to email parameter)

## Usage Examples

### Export All Requests
```bash
GET /api/admin/imagery-requests/export
Authorization: Bearer <token>
```

### Export Pending Requests
```bash
GET /api/admin/imagery-requests/export?status=pending
Authorization: Bearer <token>
```

### Export Urgent Requests from Date Range
```bash
GET /api/admin/imagery-requests/export?urgency=urgent&date_from=2024-01-01&date_to=2024-12-31
Authorization: Bearer <token>
```

### Export with Multiple Filters
```bash
GET /api/admin/imagery-requests/export?status=pending&urgency=urgent&date_from=2024-01-01
Authorization: Bearer <token>
```

## Testing

### Manual Testing
1. Start the backend server
2. Log in as admin user
3. Navigate to `/admin/imagery-requests`
4. Apply desired filters
5. Click "Export CSV" button
6. Verify CSV file downloads with correct data

### Automated Testing
Run the test script:
```bash
cd backend
node scripts/test-export-functionality.js
```

The test script verifies:
- Export all requests
- Export with status filter
- Export with date range filter
- Export with urgency filter
- Export with multiple filters
- CSV structure and headers
- Authentication requirements

## Security Considerations

1. **Authentication**: Endpoint requires valid JWT token
2. **Authorization**: Only admin users can access the endpoint
3. **Data Sanitization**: CSV values are properly escaped to prevent injection
4. **Rate Limiting**: Standard API rate limiting applies
5. **No Pagination**: Export returns all matching records (consider adding limits for very large datasets)

## Performance Notes

- Export queries all matching records without pagination
- For large datasets (>10,000 records), consider:
  - Adding a maximum export limit
  - Implementing background job processing
  - Streaming CSV generation
  - Adding progress indicators

## Future Enhancements

1. **Custom Column Selection**: Allow admins to choose which columns to export
2. **Export Formats**: Support additional formats (Excel, JSON)
3. **Scheduled Exports**: Automated periodic exports
4. **Email Delivery**: Send export file via email for large datasets
5. **Export History**: Track export operations for audit purposes
6. **Advanced Filters**: Additional filter options (company, phone, AOI area range)
