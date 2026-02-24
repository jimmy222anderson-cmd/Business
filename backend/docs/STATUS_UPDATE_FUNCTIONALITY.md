# Status Update Functionality - Implementation Summary

## Overview
This document describes the complete implementation of the status update functionality for imagery requests in the Satellite Imagery Explorer feature.

## Features Implemented

### 1. Status Update
- Admins can update the status of imagery requests through the admin panel
- Available statuses: `pending`, `reviewing`, `quoted`, `approved`, `completed`, `cancelled`
- Status changes are validated on the backend
- Frontend provides a dropdown selector for easy status changes

### 2. Admin Notes
- Admins can add internal notes to each request
- Notes are stored in the `admin_notes` field
- Notes are displayed in the request detail view
- Notes are included in status history entries

### 3. Quote Amount and Currency
- Admins can add quote information to requests
- Fields: `quote_amount` (number) and `quote_currency` (string, default: USD)
- Quote validation ensures positive amounts
- Supported currencies: USD, EUR, GBP, CAD, AUD
- Quote information is displayed prominently when status is "quoted"

### 4. Email Notifications
- Automatic email notifications sent to users when status changes
- Email includes:
  - Old status → New status transition
  - Quote details (if status is "quoted")
  - Admin notes (if provided)
  - Status-specific messages and colors
- Email template: `backend/services/email.js` - `sendImageryRequestStatusUpdate()`

### 5. Status History Tracking
- All status changes are automatically tracked in `status_history` array
- Each history entry includes:
  - `status`: The new status
  - `changed_at`: Timestamp of the change
  - `changed_by`: Reference to the admin who made the change
  - `notes`: Admin notes at the time of change
- History is tracked via Mongoose pre-save middleware
- History is displayed in chronological order in the UI

## Backend Implementation

### Model: ImageryRequest
**File:** `backend/models/ImageryRequest.js`

**Fields:**
```javascript
{
  status: String,                    // Current status
  status_history: [{                 // Array of status changes
    status: String,
    changed_at: Date,
    changed_by: ObjectId,
    notes: String
  }],
  admin_notes: String,               // Current admin notes
  quote_amount: Number,              // Quote amount
  quote_currency: String,            // Quote currency (default: USD)
  reviewed_at: Date,                 // Last review timestamp
  reviewed_by: ObjectId              // Admin who last reviewed
}
```

**Pre-save Middleware:**
- Automatically tracks status changes
- Adds new entry to `status_history` when status is modified
- Includes `changed_by`, `changed_at`, and `notes` in history entry

### API Endpoint
**Route:** `PUT /api/admin/imagery-requests/:id`
**File:** `backend/routes/admin/imageryRequests.js`

**Request Body:**
```json
{
  "status": "quoted",
  "admin_notes": "Quote prepared based on requirements",
  "quote_amount": 5000,
  "quote_currency": "USD"
}
```

**Response:**
```json
{
  "message": "Imagery request updated successfully",
  "request": {
    "_id": "...",
    "status": "quoted",
    "admin_notes": "...",
    "quote_amount": 5000,
    "quote_currency": "USD",
    "status_history": [...],
    ...
  }
}
```

**Features:**
- Validates status values
- Validates quote_amount (must be positive)
- Updates `reviewed_at` and `reviewed_by` fields
- Sends email notification on status change
- Returns updated request with populated fields

### Email Service
**File:** `backend/services/email.js`

**Function:** `sendImageryRequestStatusUpdate(email, name, request, oldStatus, newStatus)`

**Features:**
- Status-specific messages and colors
- Displays old → new status transition
- Shows quote details when status is "quoted"
- Includes admin notes if provided
- Professional HTML email template
- Plain text fallback

## Frontend Implementation

### Component: RequestDetailPanel
**File:** `src/components/admin/RequestDetailPanel.tsx`

**Features:**
- Displays complete request information
- Interactive map showing AOI
- Status dropdown selector
- Quote amount and currency inputs
- Admin notes textarea
- Status history timeline
- Save button with loading state

**Props:**
```typescript
interface RequestDetailPanelProps {
  request: ImageryRequest;
  onUpdate: (updates: Partial<ImageryRequest>) => void;
}
```

### Page: ImageryRequestsPage
**File:** `src/pages/admin/ImageryRequestsPage.tsx`

**Integration:**
- Opens RequestDetailPanel in a dialog when viewing request details
- Handles update API calls
- Refreshes request list after updates
- Shows success/error toasts

**Update Function:**
```typescript
const updateRequestStatus = async (requestId: string, updates: Partial<ImageryRequest>) => {
  // Makes PUT request to /api/admin/imagery-requests/:id
  // Closes dialog on success
  // Refreshes request list
  // Shows toast notification
}
```

## Status History Display

The status history is displayed in the RequestDetailPanel with:
- Chronological timeline of all status changes
- Status badges with color coding
- Timestamp (relative time, e.g., "2 hours ago")
- Admin who made the change
- Notes associated with each change
- Clean, card-based UI

## Testing

### Integration Test
**File:** `backend/scripts/test-status-update-integration.js`

**Run:** `node backend/scripts/test-status-update-integration.js`

**Tests:**
1. Status update from pending → reviewing
2. Status update to quoted with quote information
3. Status update to approved
4. Status history tracking
5. Field persistence

### Manual Testing Checklist
1. ✅ Admin can view request details
2. ✅ Admin can change status via dropdown
3. ✅ Admin can add/edit admin notes
4. ✅ Admin can add quote amount and currency
5. ✅ Save button updates the request
6. ✅ Status history is displayed correctly
7. ✅ Email notification is sent (check logs)
8. ✅ Request list refreshes after update
9. ✅ Toast notification shows success/error

## Email Notification Examples

### Status: Reviewing
**Subject:** Imagery Request Status Update - Reviewing
**Message:** "Our team is currently reviewing your imagery request."

### Status: Quoted
**Subject:** Imagery Request Status Update - Quoted
**Message:** "We have prepared a quote for your imagery request."
**Includes:** Quote amount and currency in highlighted box

### Status: Approved
**Subject:** Imagery Request Status Update - Approved
**Message:** "Great news! Your imagery request has been approved."

### Status: Completed
**Subject:** Imagery Request Status Update - Completed
**Message:** "Your imagery request has been completed."

### Status: Cancelled
**Subject:** Imagery Request Status Update - Cancelled
**Message:** "Your imagery request has been cancelled."

## Security Considerations

1. **Authentication:** Endpoint requires admin authentication
2. **Authorization:** Only admins can update request status
3. **Validation:** All inputs are validated on the backend
4. **Sanitization:** Admin notes are trimmed and sanitized
5. **Rate Limiting:** API endpoint is rate-limited (via existing middleware)

## Database Indexes

The following indexes support efficient queries:
- `{ status: 1, created_at: -1 }` - Filter by status
- `{ user_id: 1, created_at: -1 }` - User's requests
- `{ created_at: -1 }` - Recent requests

## Future Enhancements

Potential improvements for future iterations:
1. Bulk status updates for multiple requests
2. Status change notifications via webhooks
3. Customizable email templates per status
4. Status change approval workflow
5. Automated status transitions based on rules
6. Export status history as CSV
7. Status change analytics and reporting

## Troubleshooting

### Email not sending
- Check `EMAIL_SERVICE` environment variable
- Verify email credentials in `.env`
- Check email queue logs if using queue
- Review `backend/services/email.js` for errors

### Status history not tracking
- Verify pre-save middleware is running
- Check that status field is actually modified
- Ensure `reviewed_by` is set before save

### Frontend not updating
- Check browser console for errors
- Verify API endpoint is accessible
- Check authentication token is valid
- Ensure dialog closes and list refreshes

## Related Files

### Backend
- `backend/models/ImageryRequest.js` - Model definition
- `backend/routes/admin/imageryRequests.js` - API routes
- `backend/services/email.js` - Email service
- `backend/services/emailHelper.js` - Email helper wrapper

### Frontend
- `src/components/admin/RequestDetailPanel.tsx` - Detail panel component
- `src/pages/admin/ImageryRequestsPage.tsx` - Admin page
- `src/lib/api/imageryRequests.ts` - API client functions

### Tests
- `backend/scripts/test-status-update-integration.js` - Integration test
- `src/test/RequestDetailPanel.test.tsx` - Component test

## Conclusion

The status update functionality is fully implemented and includes:
- ✅ Status updates
- ✅ Admin notes
- ✅ Quote amount and currency
- ✅ Email notifications
- ✅ Status history tracking

All sub-tasks for task 18.5 have been completed successfully.
