# Analytics Metrics Documentation

## Overview
This document describes the analytics metrics calculated for imagery requests in the admin dashboard.

## Metrics

### 1. Average Response Time
**Description**: Measures the average time (in hours) from when a request is created to when it receives its first status change.

**Calculation**:
- For each request with status history, calculate the time difference between `created_at` and the first status change (index 1 in status_history, since index 0 is the initial 'pending' status)
- Convert milliseconds to hours
- Calculate the average across all requests with status changes

**Use Case**: Helps track how quickly the admin team responds to new requests. Lower values indicate faster response times.

**Display**: Shows as "X.XX h" in the dashboard card, or "N/A" if no data is available.

---

### 2. Conversion Rate
**Description**: Percentage of requests that have been successfully converted from pending to approved or completed status.

**Calculation**:
- Count requests with status 'approved' or 'completed'
- Divide by total number of requests
- Multiply by 100 to get percentage

**Formula**: `(approved + completed) / total_requests * 100`

**Use Case**: Indicates the success rate of imagery requests. Higher values suggest more requests are being fulfilled.

**Display**: Shows as "XX.XX%" in the dashboard card with label "Pending → Approved".

---

### 3. Requests by Urgency
**Description**: Distribution of requests across different urgency levels (standard, urgent, emergency).

**Calculation**:
- Group all requests by their `urgency` field
- Count requests in each group
- Return array of objects with urgency level and count

**Use Case**: Helps understand the priority distribution of incoming requests and resource allocation needs.

**Display**: 
- Summary card shows count of urgent + emergency requests
- Bar chart shows distribution across all urgency levels

---

### 4. Requests by User Type
**Description**: Breakdown of requests by whether they were submitted by guest users or registered users.

**Calculation**:
- Count requests where `user_id` is null (guest users)
- Count requests where `user_id` is not null (registered users)
- Return array with both counts

**Use Case**: Helps understand user engagement and the value of user registration. Can inform decisions about guest vs. authenticated user features.

**Display**:
- Summary card shows registered user count with guest count in subtitle
- Pie chart shows visual distribution between guest and registered users

---

## API Endpoint

**Endpoint**: `GET /api/admin/analytics/imagery-requests`

**Authentication**: Requires admin authentication

**Response Format**:
```json
{
  "totalRequests": 150,
  "requestsByStatus": [...],
  "requestsOverTime": [...],
  "popularProducts": [...],
  "avgAoiSize": 125.50,
  "avgResponseTime": 24.75,
  "conversionRate": 65.33,
  "requestsByUrgency": [
    { "urgency": "standard", "count": 100 },
    { "urgency": "urgent", "count": 40 },
    { "urgency": "emergency", "count": 10 }
  ],
  "requestsByUserType": [
    { "userType": "guest", "count": 80 },
    { "userType": "registered", "count": 70 }
  ]
}
```

---

## Implementation Notes

### Average Response Time
- Only includes requests that have at least one status change
- Uses the `status_history` array which is automatically populated by the pre-save middleware in the ImageryRequest model
- Time is calculated in hours for better readability

### Conversion Rate
- Assumes all requests start as 'pending' (enforced by model default)
- Considers both 'approved' and 'completed' as successful conversions
- Returns 0 if there are no requests to avoid division by zero

### Requests by Urgency
- All three urgency levels are included: standard, urgent, emergency
- Sorted alphabetically by urgency level
- Empty array if no requests exist

### Requests by User Type
- Guest users are identified by `user_id: null`
- Registered users have a valid ObjectId in `user_id`
- Always returns both types even if count is 0

---

## Performance Considerations

All metrics use MongoDB aggregation pipelines for efficient calculation:
- Aggregations are performed at the database level
- Indexes on `status`, `user_id`, and `created_at` fields improve query performance
- Results are rounded to 2 decimal places for consistency

---

## Future Enhancements

Potential improvements for analytics:
1. Add time-based filtering (e.g., last 7 days, last 30 days, custom range)
2. Add comparison with previous period (e.g., "↑ 15% from last month")
3. Add median response time in addition to average
4. Add conversion funnel visualization (pending → reviewing → quoted → approved)
5. Add export functionality for analytics data
6. Add real-time updates using WebSockets
