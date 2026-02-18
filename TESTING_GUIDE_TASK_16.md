# Testing Guide: Task 16 - User Experience Improvements

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend
   node server.js
   ```
   - Should see: "Server running on port 3000"
   - MongoDB should be connected

2. **Frontend Server Running**
   ```bash
   npm run dev
   ```
   - Should see: "Local: http://localhost:5173"

3. **Test User Account**
   - Email: test@example.com (or your test account)
   - Password: your test password
   - Must have at least one imagery request

## Test 1: Cancel Request Feature

### Step-by-Step Testing

1. **Navigate to Dashboard**
   - Open browser: http://localhost:5173
   - Click "Sign In" (top right)
   - Enter credentials and sign in
   - Click "Dashboard" or navigate to http://localhost:5173/dashboard/imagery

2. **Open Request Details**
   - You should see a list of your imagery requests
   - Find a request with status "pending" or "reviewing"
   - Click "View Details" button on that request
   - A modal should open showing request details

3. **Verify Cancel Button Visibility**
   - Scroll to the bottom of the modal
   - You should see two buttons:
     - "Duplicate Request" (left)
     - "Cancel Request" (right, red color)
   - If status is NOT "pending" or "reviewing", Cancel button won't show

4. **Click Cancel Request**
   - Click the red "Cancel Request" button
   - **Expected:** A confirmation dialog should appear
   - **If you see black screen:** There's still an issue

5. **Confirmation Dialog Should Show:**
   - Title: "Cancel Imagery Request?"
   - Description: "Are you sure you want to cancel..."
   - Text area: "Reason for cancellation (optional)"
   - Two buttons:
     - "Keep Request" (left)
     - "Cancel Request" (right, red)

6. **Test Cancellation**
   - Type a reason (optional): "Testing cancellation feature"
   - Click "Cancel Request" button
   - **Expected:**
     - Dialog closes
     - Success toast appears: "Request Cancelled"
     - Main modal closes
     - Request list refreshes
     - Request status changes to "cancelled"

### Debugging Steps if Cancel Button Doesn't Work

**Check Browser Console (F12):**
```javascript
// Look for errors like:
- "Cannot read property 'sendEmail'"
- "AlertDialog is not defined"
- "showCancelDialog is not a function"
```

**Check Network Tab (F12 → Network):**
- Click Cancel Request
- Look for POST request to: `/api/user/imagery-requests/{id}/cancel`
- Check response:
  - 200 OK = Success
  - 400 = Cannot cancel (wrong status)
  - 404 = Request not found
  - 500 = Server error

**Check Backend Logs:**
```bash
# In backend terminal, look for:
- "Processing email job: ..." (if email queue is enabled)
- "Email sent successfully" or "Failed to send email"
- Any error messages
```

## Test 2: Duplicate Request Feature

### Step-by-Step Testing

1. **Open Request Details**
   - From dashboard, click "View Details" on ANY request
   - Modal opens with request details

2. **Click Duplicate Request**
   - Click the "Duplicate Request" button (left button at bottom)
   - **Expected:**
     - Success toast appears: "Request Duplicated"
     - Modal closes
     - Browser navigates to /explore page

3. **Verify Explorer Page**
   - **Expected on Explorer page:**
     - Map loads
     - AOI is automatically drawn on map (yellow polygon/rectangle)
     - Map centers on the AOI
     - Filters are applied (check filter panel)
     - Request form opens automatically after ~500ms

4. **Verify Form Pre-fill**
   - Request form should be open
   - Check these fields are pre-filled:
     - Date Range: Start and End dates from original request
     - Urgency: Same as original (Standard/Urgent/Emergency)
     - Additional Requirements: Same text as original

5. **Test Modification**
   - Change any field (e.g., change urgency to "Urgent")
   - Change date range
   - Add/modify additional requirements
   - Click "Submit Request"
   - **Expected:**
     - New request is created
     - Original request is unchanged
     - Success message appears

### Debugging Steps if Duplicate Doesn't Work

**Check Browser Console:**
```javascript
// Look for errors like:
- "Cannot read property 'aoi_coordinates'"
- "navigate is not a function"
- "duplicateRequest is undefined"
```

**Check React DevTools:**
- Open React DevTools (F12 → Components)
- Find ExplorerPage component
- Check state:
  - `pendingDuplicateRequest` should have data initially
  - `currentAOI` should be set after processing
  - `duplicateRequestData` should have urgency, date_range, etc.

## Common Issues and Solutions

### Issue 1: Black Screen on Cancel
**Symptoms:** Clicking Cancel Request shows black screen

**Possible Causes:**
1. AlertDialog not rendering
2. Z-index conflict with main Dialog
3. Portal rendering issue

**Solution:**
- AlertDialog is now conditionally rendered outside main Dialog
- Check if `showCancelDialog` state is being set to true
- Check browser console for React errors

### Issue 2: Cancel Button Not Visible
**Symptoms:** No Cancel Request button appears

**Possible Causes:**
1. Request status is not "pending" or "reviewing"
2. `canCancel` variable is false

**Solution:**
- Check request status in the modal
- Only pending/reviewing requests can be cancelled
- Check console: `console.log('canCancel:', canCancel)`

### Issue 3: Duplicate Navigation Fails
**Symptoms:** Clicking Duplicate doesn't navigate to Explorer

**Possible Causes:**
1. Navigation error
2. Missing request data
3. Route not found

**Solution:**
- Check browser console for navigation errors
- Verify /explore route exists
- Check if request data is complete

### Issue 4: Form Not Pre-filling
**Symptoms:** Form opens but fields are empty

**Possible Causes:**
1. `duplicateRequestData` not being set
2. `useEffect` not triggering
3. Form reset happening after pre-fill

**Solution:**
- Check ExplorerPage state in React DevTools
- Verify `duplicateRequestData` has values
- Check RequestForm component receives the prop

## Manual Verification Checklist

### Cancel Request
- [ ] Cancel button visible for pending requests
- [ ] Cancel button visible for reviewing requests
- [ ] Cancel button NOT visible for quoted requests
- [ ] Cancel button NOT visible for approved requests
- [ ] Cancel button NOT visible for completed requests
- [ ] Cancel button NOT visible for cancelled requests
- [ ] Confirmation dialog appears
- [ ] Can enter cancellation reason
- [ ] Can click "Keep Request" to abort
- [ ] Can click "Cancel Request" to confirm
- [ ] Loading state shows during cancellation
- [ ] Success toast appears
- [ ] Modal closes properly
- [ ] Request list refreshes
- [ ] Status updates to "cancelled"
- [ ] No black screen appears
- [ ] No console errors

### Duplicate Request
- [ ] Duplicate button visible for all requests
- [ ] Clicking button navigates to Explorer
- [ ] Success toast appears
- [ ] AOI draws on map
- [ ] Map centers on AOI
- [ ] Filters are applied
- [ ] Form opens automatically
- [ ] Date range pre-filled
- [ ] Urgency pre-filled
- [ ] Additional requirements pre-filled
- [ ] Can modify all fields
- [ ] Can submit new request
- [ ] Original request unchanged
- [ ] No console errors

## Expected API Calls

### Cancel Request
```
POST /api/user/imagery-requests/{id}/cancel
Content-Type: application/json

{
  "cancellation_reason": "Testing cancellation"
}

Response 200:
{
  "message": "Imagery request cancelled successfully",
  "request": {
    "_id": "...",
    "status": "cancelled",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Requests (after cancel)
```
GET /api/user/imagery-requests?page=1&limit=20

Response 200:
{
  "requests": [...],
  "pagination": {...}
}
```

## Success Criteria

✅ **Cancel Request:**
- Confirmation dialog appears
- Request status changes to "cancelled"
- Admin receives email notification
- UI updates without page refresh

✅ **Duplicate Request:**
- Navigates to Explorer page
- AOI appears on map
- Form pre-fills with data
- Can modify and submit

## If Tests Fail

1. **Check Backend Logs**
   - Look for error messages
   - Verify email service is configured
   - Check MongoDB connection

2. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests
   - Verify API responses

3. **Check React DevTools**
   - Verify component state
   - Check props being passed
   - Look for re-render issues

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear localStorage
   - Try incognito mode

5. **Restart Servers**
   - Stop backend and frontend
   - Clear node_modules if needed
   - Restart both servers

## Contact for Issues

If tests still fail after following this guide:
1. Take screenshots of:
   - Browser console errors
   - Network tab showing failed requests
   - Backend terminal logs
2. Note the exact steps that fail
3. Check the TASK_16_BUGFIXES.md document for known issues
