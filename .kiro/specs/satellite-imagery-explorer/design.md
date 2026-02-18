# Design: Satellite Imagery Explorer

## Architecture Overview

### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Explorer Page│  │ Map Component│  │ Filter Panel │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Product List │  │ Request Form │  │ User Dashboard│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Products API │  │ Requests API │  │ AOI API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Geocoding    │  │ File Upload  │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
├─────────────────────────────────────────────────────────────┤
│  • SatelliteProducts    • ImageryRequests                   │
│  • SavedAOIs            • Users                              │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Map Library**: Leaflet.js (open-source, lightweight, extensive plugin ecosystem)
- **Drawing Tools**: Leaflet.draw plugin
- **Geocoding**: Nominatim (OpenStreetMap) or Mapbox Geocoding API
- **Date Picker**: react-datepicker
- **File Parsing**: @tmcw/togeojson (KML), native JSON.parse (GeoJSON)
- **UI Components**: Existing shadcn/ui components
- **State Management**: React hooks (useState, useContext)

### Backend
- **Framework**: Express.js (existing)
- **Database**: MongoDB with Mongoose (existing)
- **File Upload**: Multer (existing)
- **Email**: Existing email service
- **Validation**: Joi or express-validator

### External Services
- **Map Tiles**: OpenStreetMap (free) or Mapbox (paid, better quality)
- **Geocoding**: Nominatim (free) or Mapbox Geocoding API (paid)

## Data Models

### SatelliteProduct
```javascript
{
  _id: ObjectId,
  name: String,                    // "Maxar WorldView-3"
  provider: String,                // "Maxar Technologies"
  sensor_type: String,             // "optical", "radar", "thermal"
  resolution: Number,              // in meters, e.g., 0.31
  resolution_category: String,     // "vhr", "high", "medium", "low"
  bands: [String],                 // ["RGB", "NIR", "Red-Edge"]
  coverage: String,                // "Global", "Regional"
  availability: String,            // "archive", "tasking", "both"
  description: String,
  sample_image_url: String,
  specifications: {
    swath_width: Number,           // in km
    revisit_time: Number,          // in days
    spectral_bands: Number,
    radiometric_resolution: Number // in bits
  },
  pricing_info: String,            // "Contact for pricing"
  status: String,                  // "active", "inactive"
  order: Number,
  created_at: Date,
  updated_at: Date
}
```

### ImageryRequest
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,               // Reference to UserProfile (null if guest)
  
  // Contact Information
  full_name: String,
  email: String,
  company: String,
  phone: String,
  
  // AOI Data
  aoi_type: String,                // "polygon", "rectangle", "circle"
  aoi_coordinates: {
    type: String,                  // "Polygon", "Point" (for circle center)
    coordinates: [[Number]]        // GeoJSON format
  },
  aoi_area_km2: Number,
  aoi_center: {
    lat: Number,
    lng: Number
  },
  
  // Request Parameters
  date_range: {
    start_date: Date,
    end_date: Date
  },
  filters: {
    resolution_category: [String], // ["vhr", "high"]
    max_cloud_coverage: Number,    // 0-100
    providers: [String],
    bands: [String],
    image_types: [String]
  },
  
  // Additional Details
  urgency: String,                 // "standard", "urgent", "emergency"
  additional_requirements: String,
  
  // Status Tracking
  status: String,                  // "pending", "reviewing", "quoted", "approved", "completed", "cancelled"
  admin_notes: String,
  quote_amount: Number,
  quote_currency: String,
  
  // Metadata
  created_at: Date,
  updated_at: Date,
  reviewed_at: Date,
  reviewed_by: ObjectId
}
```

### SavedAOI
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,               // Reference to UserProfile
  name: String,                    // User-defined name
  description: String,
  
  // AOI Data
  aoi_type: String,
  aoi_coordinates: {
    type: String,
    coordinates: [[Number]]
  },
  aoi_area_km2: Number,
  aoi_center: {
    lat: Number,
    lng: Number
  },
  
  // Metadata
  created_at: Date,
  updated_at: Date,
  last_used_at: Date
}
```

## API Endpoints

### Public Endpoints

#### GET /api/public/satellite-products
Get list of active satellite products
```javascript
Query Parameters:
  - resolution_category: string (optional)
  - sensor_type: string (optional)
  - availability: string (optional)
  - page: number (default: 1)
  - limit: number (default: 20)

Response: {
  products: [SatelliteProduct],
  total: number,
  page: number,
  totalPages: number
}
```

#### GET /api/public/satellite-products/:id
Get single product details

#### POST /api/public/imagery-requests
Submit imagery request (guest or authenticated)
```javascript
Body: {
  full_name: string,
  email: string,
  company: string (optional),
  phone: string (optional),
  aoi_type: string,
  aoi_coordinates: object,
  aoi_area_km2: number,
  aoi_center: object,
  date_range: object,
  filters: object,
  urgency: string,
  additional_requirements: string (optional)
}

Response: {
  request_id: string,
  message: string
}
```

#### POST /api/public/geocode
Geocode location search
```javascript
Body: {
  query: string
}

Response: {
  results: [{
    name: string,
    lat: number,
    lng: number,
    bbox: [number, number, number, number]
  }]
}
```

### Authenticated User Endpoints

#### GET /api/user/saved-aois
Get user's saved AOIs

#### POST /api/user/saved-aois
Save new AOI
```javascript
Body: {
  name: string,
  description: string (optional),
  aoi_type: string,
  aoi_coordinates: object,
  aoi_area_km2: number,
  aoi_center: object
}
```

#### DELETE /api/user/saved-aois/:id
Delete saved AOI

#### GET /api/user/imagery-requests
Get user's imagery requests
```javascript
Query Parameters:
  - status: string (optional)
  - page: number
  - limit: number
```

#### GET /api/user/imagery-requests/:id
Get single request details

### Admin Endpoints

#### GET /api/admin/satellite-products
Get all products (including inactive)

#### POST /api/admin/satellite-products
Create new product

#### PUT /api/admin/satellite-products/:id
Update product

#### DELETE /api/admin/satellite-products/:id
Delete product

#### GET /api/admin/imagery-requests
Get all imagery requests with filters
```javascript
Query Parameters:
  - status: string
  - date_from: date
  - date_to: date
  - user_id: string
  - page: number
  - limit: number
```

#### PUT /api/admin/imagery-requests/:id
Update request status and details
```javascript
Body: {
  status: string,
  admin_notes: string,
  quote_amount: number,
  quote_currency: string
}
```

#### POST /api/admin/imagery-requests/:id/export
Export request data

## Frontend Components

### Page: ExplorerPage (`/explore`)
Main satellite imagery explorer interface

**Components:**
- MapContainer (full-screen map)
- FilterPanel (collapsible sidebar)
- SearchBar (location search)
- DrawingToolbar (AOI tools)
- RequestButton (submit request)

### Component: MapContainer
Interactive map with drawing capabilities

**Props:**
- onAOIChange: (aoi) => void
- initialCenter: { lat, lng }
- initialZoom: number

**State:**
- map: Leaflet map instance
- drawnItems: FeatureGroup
- currentAOI: object

**Features:**
- Base layer switching (satellite, street, terrain)
- Drawing tools (polygon, rectangle, circle)
- Edit/delete drawn shapes
- Calculate area
- Display coordinates

### Component: FilterPanel
Sidebar with imagery filters

**Props:**
- onFilterChange: (filters) => void
- initialFilters: object

**State:**
- filters: object
- isExpanded: boolean

**Sections:**
- Date Range Picker
- Resolution Filter
- Cloud Coverage Slider
- Provider Checkboxes
- Bands Checkboxes
- Image Type Radio

### Component: SearchBar
Location search with autocomplete

**Props:**
- onLocationSelect: (location) => void

**State:**
- query: string
- results: array
- isLoading: boolean

**Features:**
- Debounced search
- Dropdown suggestions
- Recent searches
- Coordinate input support

### Component: ProductCatalog
Display available satellite products

**Props:**
- filters: object

**State:**
- products: array
- loading: boolean
- page: number

**Features:**
- Product cards with thumbnails
- Sorting options
- Pagination
- Product detail modal

### Component: RequestForm
Form to submit imagery request

**Props:**
- aoi: object
- filters: object
- dateRange: object

**State:**
- formData: object
- isSubmitting: boolean
- errors: object

**Features:**
- Auto-fill for logged-in users
- Validation
- Summary of request
- Confirmation modal

### Page: UserDashboard (`/dashboard/imagery`)
User's saved AOIs and requests

**Components:**
- SavedAOIsList
- RequestHistoryTable
- RequestDetailModal

### Page: AdminImageryRequests (`/admin/imagery-requests`)
Admin management of imagery requests

**Components:**
- RequestsTable (with filters)
- RequestDetailPanel
- StatusUpdateForm
- ExportButton

## UI/UX Design

### Color Scheme
- Primary: Yellow (#EAB308) - existing brand color
- Map Controls: Dark with transparency
- AOI Highlight: Yellow with 30% opacity
- Active Filters: Yellow badges

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ Navbar                                                   │
├──────────┬──────────────────────────────────────────────┤
│          │                                               │
│ Filter   │                                               │
│ Panel    │          Interactive Map                      │
│          │                                               │
│ [Expand] │                                               │
│          │                                               │
│          │                                               │
├──────────┴──────────────────────────────────────────────┤
│ [Search Location]  [Drawing Tools]  [Submit Request]    │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────────────┐
│ Navbar                       │
├─────────────────────────────┤
│                              │
│                              │
│     Interactive Map          │
│                              │
│                              │
├─────────────────────────────┤
│ [Filters] [Tools] [Request] │
└─────────────────────────────┘
```

## Implementation Phases

### Phase 1: Core Map Functionality (MVP)
- Basic map with Leaflet
- Drawing tools (polygon, rectangle)
- Location search
- Simple request form
- Database models
- Basic API endpoints

### Phase 2: Filters & Products
- Filter panel
- Date range picker
- Product catalog
- Advanced request form
- Email notifications

### Phase 3: User Features
- Saved AOIs
- Request history
- User dashboard
- Auto-fill forms

### Phase 4: Admin Features
- Product management
- Request management
- Status updates
- Export functionality

### Phase 5: Advanced Features
- File upload (KML/GeoJSON)
- Circle drawing tool
- Advanced geocoding
- Mobile optimization
- Performance optimization

## Security Considerations

1. **Input Validation**
   - Validate AOI coordinates
   - Sanitize file uploads
   - Validate date ranges
   - Rate limit API calls

2. **Authentication**
   - Use existing auth middleware
   - Protect user-specific endpoints
   - Protect admin endpoints

3. **Data Privacy**
   - Don't expose user emails in public APIs
   - Encrypt sensitive data
   - GDPR compliance for data storage

4. **File Upload Security**
   - Validate file types
   - Limit file sizes
   - Scan for malicious content
   - Store in secure location

## Performance Optimization

1. **Map Performance**
   - Lazy load map tiles
   - Debounce drawing events
   - Limit number of drawn features
   - Use vector tiles for better performance

2. **API Performance**
   - Implement caching for product catalog
   - Paginate large result sets
   - Index database queries
   - Use CDN for static assets

3. **Frontend Performance**
   - Code splitting
   - Lazy load components
   - Optimize images
   - Minimize bundle size

## Testing Strategy

1. **Unit Tests**
   - Utility functions (area calculation, coordinate conversion)
   - Form validation
   - API request/response handling

2. **Integration Tests**
   - API endpoints
   - Database operations
   - Email notifications

3. **E2E Tests**
   - Complete user flow (draw AOI → submit request)
   - Admin workflow
   - Mobile responsiveness

4. **Manual Testing**
   - Cross-browser compatibility
   - Mobile device testing
   - Accessibility testing

## Accessibility

- Keyboard navigation for all interactive elements
- ARIA labels for map controls
- Screen reader support for form fields
- High contrast mode support
- Focus indicators
- Alt text for images

## Monitoring & Analytics

- Track user interactions (AOI draws, searches, requests)
- Monitor API performance
- Error logging and alerting
- User feedback collection
- A/B testing for UI improvements
