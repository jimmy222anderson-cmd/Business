# Geocoding Service Enhancement

## Overview
The geocoding service has been enhanced to support multiple providers, reverse geocoding, autocomplete suggestions, recent searches, and favorite locations.

## Features

### 1. Multiple Provider Support
The geocoding service now supports multiple providers with automatic fallback:
- **Nominatim (OpenStreetMap)**: Free, always enabled (priority 1)
- **Mapbox**: Paid, enabled when `MAPBOX_ACCESS_TOKEN` is configured (priority 2)

Providers are tried in order of priority. If the first provider fails or returns no results, the service automatically falls back to the next provider.

### 2. Reverse Geocoding
Convert coordinates to place names:
```javascript
POST /api/public/reverse
{
  "lat": 40.7128,
  "lng": -74.0060,
  "provider": "nominatim" // optional
}
```

### 3. Autocomplete Suggestions
Get location suggestions as the user types:
```javascript
POST /api/public/autocomplete
{
  "query": "New Y",
  "provider": "nominatim" // optional
}
```

### 4. Recent Searches
Recent searches are stored in the browser's localStorage and displayed when the search bar is focused with an empty query.

Features:
- Stores up to 5 recent searches
- Persists across browser sessions
- Automatically removes duplicates
- Displayed with a clock icon

### 5. Favorite Locations
Authenticated users can save favorite locations for quick access.

#### API Endpoints

**Get Favorites**
```javascript
GET /api/user/favorite-locations
Authorization: Bearer <token>
```

**Add Favorite**
```javascript
POST /api/user/favorite-locations
Authorization: Bearer <token>
{
  "name": "My Project Site",
  "place_name": "New York, NY, USA",
  "lat": 40.7128,
  "lng": -74.0060,
  "bbox": [-74.2591, 40.4774, -73.7004, 40.9176],
  "provider": "nominatim"
}
```

**Update Favorite Name**
```javascript
PUT /api/user/favorite-locations/:id
Authorization: Bearer <token>
{
  "name": "Updated Name"
}
```

**Update Last Used**
```javascript
PUT /api/user/favorite-locations/:id/use
Authorization: Bearer <token>
```

**Delete Favorite**
```javascript
DELETE /api/user/favorite-locations/:id
Authorization: Bearer <token>
```

#### Limits
- Maximum 50 favorite locations per user
- Names must be unique per user
- Names can be up to 200 characters

## Frontend Components

### SearchBar Component
Enhanced with:
- Autocomplete suggestions using the new endpoint
- Recent searches display (when focused with empty query)
- Favorite locations display (for authenticated users)
- Visual icons to distinguish between search results, favorites, and recent searches
- Keyboard navigation support

### FavoriteLocationDialog Component
New component for adding locations to favorites:
- Displays location details
- Allows custom naming
- Validates input
- Shows success/error messages

## Database Model

### FavoriteLocation
```javascript
{
  user_id: ObjectId,           // Reference to UserProfile
  name: String,                // User-defined name (max 200 chars)
  place_name: String,          // Full place name from geocoding
  lat: Number,                 // Latitude (-90 to 90)
  lng: Number,                 // Longitude (-180 to 180)
  bbox: [Number],              // Bounding box [west, south, east, north]
  provider: String,            // 'nominatim', 'mapbox', or 'manual'
  created_at: Date,
  last_used_at: Date
}
```

Indexes:
- `{ user_id: 1, name: 1 }` - Unique compound index
- `{ user_id: 1, last_used_at: -1 }` - For sorting by usage

## Configuration

### Environment Variables
```bash
# Optional: Enable Mapbox geocoding
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

If `MAPBOX_ACCESS_TOKEN` is not set, the service will only use Nominatim.

## Testing

### Test Scripts
```bash
# Test basic geocoding
node scripts/test-geocoding.js

# Test autocomplete and reverse geocoding
node scripts/test-geocoding-autocomplete.js
```

### Manual Testing
1. Start the backend server
2. Test autocomplete:
   ```bash
   curl -X POST http://localhost:5000/api/public/autocomplete \
     -H "Content-Type: application/json" \
     -d '{"query": "New Y"}'
   ```

3. Test reverse geocoding:
   ```bash
   curl -X POST http://localhost:5000/api/public/reverse \
     -H "Content-Type: application/json" \
     -d '{"lat": 40.7128, "lng": -74.0060}'
   ```

4. Test favorite locations (requires authentication):
   ```bash
   # Get favorites
   curl http://localhost:5000/api/user/favorite-locations \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Add favorite
   curl -X POST http://localhost:5000/api/user/favorite-locations \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "My Location",
       "place_name": "New York, NY, USA",
       "lat": 40.7128,
       "lng": -74.0060
     }'
   ```

## Implementation Details

### Service Architecture
The `GeocodingService` class (`backend/services/geocoding.js`) provides:
- Provider management and fallback logic
- Unified interface for all geocoding operations
- Automatic provider selection based on configuration
- Error handling and retry logic

### Frontend Integration
The `SearchBar` component integrates all features:
- Uses `useAuth` hook to check authentication status
- Loads favorites on mount for authenticated users
- Stores recent searches in localStorage
- Displays different icons for different result types
- Supports keyboard navigation

## Future Enhancements
- Add more geocoding providers (Google Maps, HERE, etc.)
- Implement rate limiting per provider
- Add caching for frequently searched locations
- Support for bulk geocoding
- Export/import favorite locations
- Share favorite locations between users
