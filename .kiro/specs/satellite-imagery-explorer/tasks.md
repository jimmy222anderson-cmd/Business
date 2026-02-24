# Tasks: Satellite Imagery Explorer

## Phase 1: Core Map Functionality (MVP)

### 1. Database Setup
- [x] 1.1 Create SatelliteProduct model
  - Define schema with all fields (name, provider, resolution, bands, etc.)
  - Add indexes for common queries (status, resolution_category)
  - Add validation rules
- [x] 1.2 Create ImageryRequest model
  - Define schema with AOI data, filters, contact info
  - Add GeoJSON support for coordinates
  - Add indexes for user_id, status, created_at
  - Add validation rules
- [x] 1.3 Create SavedAOI model
  - Define schema for user's saved areas
  - Add indexes for user_id
  - Add validation rules
- [x] 1.4 Seed sample satellite products
  - Create seed data for 10-15 popular satellites
  - Include Maxar, Planet Labs, ICEYE, Sentinel, Landsat
  - Add realistic specifications and sample images

### 2. Backend API - Products
- [x] 2.1 Create public products routes
  - GET /api/public/satellite-products (list with pagination)
  - GET /api/public/satellite-products/:id (single product)
  - Add query filters (resolution_category, sensor_type, availability)
  - Add sorting options
- [x] 2.2 Create admin products routes
  - GET /api/admin/satellite-products (all products)
  - POST /api/admin/satellite-products (create)
  - PUT /api/admin/satellite-products/:id (update)
  - DELETE /api/admin/satellite-products/:id (delete)
  - Add authentication and authorization middleware
- [x] 2.3 Add product validation
  - Validate required fields
  - Validate resolution values
  - Validate enum fields (sensor_type, availability, status)

### 3. Backend API - Imagery Requests
- [x] 3.1 Create public imagery request routes
  - POST /api/public/imagery-requests (submit request)
  - Validate AOI coordinates
  - Validate contact information
  - Calculate AOI area from coordinates
- [x] 3.2 Create user imagery request routes
  - GET /api/user/imagery-requests (user's requests)
  - GET /api/user/imagery-requests/:id (single request)
  - Add pagination and filtering
  - Require authentication
- [x] 3.3 Create admin imagery request routes
  - GET /api/admin/imagery-requests (all requests with filters)
  - PUT /api/admin/imagery-requests/:id (update status)
  - Add status update functionality
  - Add admin notes functionality
- [x] 3.4 Add email notifications
  - Send confirmation email to user on request submission
  - Send notification email to admin on new request
  - Use existing email service
  - Include request details and AOI summary

### 4. Frontend - Map Component
- [x] 4.1 Install and configure Leaflet
  - Install leaflet and react-leaflet packages
  - Install leaflet.draw plugin
  - Configure TypeScript types
  - Add Leaflet CSS to project
- [x] 4.2 Create MapContainer component
  - Initialize Leaflet map with default view
  - Add base layer (OpenStreetMap tiles)
  - Add zoom controls
  - Add scale control
  - Make map responsive
- [x] 4.3 Add drawing tools
  - Integrate Leaflet.draw plugin
  - Add polygon drawing tool
  - Add rectangle drawing tool
  - Add edit functionality
  - Add delete functionality
  - Limit to one AOI at a time
- [x] 4.4 Add AOI data capture
  - Capture drawn coordinates in GeoJSON format
  - Calculate area in square kilometers
  - Calculate center point
  - Emit AOI data to parent component
  - Display area on map
- [x] 4.5 Add visual styling
  - Style drawn shapes (yellow with transparency)
  - Style drawing controls
  - Add hover effects
  - Add active state styling

### 5. Frontend - Location Search
- [x] 5.1 Create SearchBar component
  - Add search input with icon
  - Add loading state
  - Add dropdown for results
  - Style to match design system
- [x] 5.2 Implement geocoding
  - Create geocoding API endpoint (use Nominatim)
  - Add debounced search (300ms delay)
  - Display search results in dropdown
  - Handle no results case
- [x] 5.3 Add search functionality
  - Support city/country name search
  - Support coordinate input (lat, lng)
  - Center map on selected location
  - Zoom to appropriate level
  - Clear search on selection

### 6. Frontend - Request Form
- [x] 6.1 Create RequestForm component
  - Create modal/drawer layout
  - Add form fields (name, email, company, phone)
  - Add urgency selector
  - Add additional requirements textarea
  - Add form validation with react-hook-form
- [x] 6.2 Add AOI summary display
  - Show AOI type (polygon/rectangle)
  - Show area in km²
  - Show center coordinates
  - Show bounding box
  - Add visual preview (small map or coordinates)
- [x] 6.3 Implement form submission
  - Validate all required fields
  - Combine form data with AOI data
  - Submit to API endpoint
  - Show loading state during submission
  - Show success message
  - Show error messages
- [x] 6.4 Add auto-fill for logged-in users
  - Check authentication status
  - Auto-fill name, email, company from user profile
  - Allow editing of auto-filled data

### 7. Frontend - Explorer Page
- [x] 7.1 Create ExplorerPage component
  - Set up page layout (full-screen map)
  - Add MapContainer
  - Add SearchBar overlay
  - Add drawing toolbar
  - Add "Submit Request" button
- [x] 7.2 Add state management
  - Manage current AOI state
  - Manage search state
  - Manage request form visibility
  - Handle component communication
- [x] 7.3 Add user flow
  - Enable request button only when AOI is drawn
  - Open request form on button click
  - Pass AOI data to form
  - Handle form submission success
  - Clear AOI after successful submission (optional)
- [x] 7.4 Add responsive design
  - Optimize for desktop (1920x1080)
  - Optimize for tablet (768x1024)
  - Optimize for mobile (375x667)
  - Adjust toolbar layout for mobile
  - Make search bar mobile-friendly

### 8. Navigation & Routing
- [x] 8.1 Add Explorer route
  - Add /explore route to App.tsx
  - Add route to navigation menu
  - Add icon for Explorer in navbar
  - Update navbar highlighting
- [x] 8.2 Add page metadata
  - Add page title
  - Add meta description
  - Add Open Graph tags

### 9. Testing & Bug Fixes
- [x] 9.1 Test map functionality
  - Test drawing polygon
  - Test drawing rectangle
  - Test editing shapes
  - Test deleting shapes
  - Test area calculation accuracy
- [x] 9.2 Test search functionality
  - Test location name search
  - Test coordinate search
  - Test search result selection
  - Test map centering
- [x] 9.3 Test request submission
  - Test form validation
  - Test successful submission
  - Test error handling
  - Test email notifications
- [x] 9.4 Test responsive design
  - Test on desktop browsers
  - Test on tablet
  - Test on mobile devices
  - Test touch interactions

## Phase 2: Filters & Products

### 10. Frontend - Filter Panel
- [x] 10.1 Create FilterPanel component
  - Create collapsible sidebar layout
  - Add expand/collapse button
  - Add filter sections
  - Style to match design system
- [x] 10.2 Add date range filter
  - Install react-datepicker
  - Add start date picker
  - Add end date picker
  - Add preset options (Last 7 days, 30 days, etc.)
  - Validate date range (end >= start)
- [x] 10.3 Add resolution filter
  - Add checkboxes for VHR, High, Medium, Low
  - Add resolution descriptions
  - Allow multiple selections
- [x] 10.4 Add cloud coverage filter
  - Add slider (0-100%)
  - Add percentage display
  - Add preset options (0-10%, 0-20%, etc.)
- [x] 10.5 Add provider filter
  - Fetch providers from products API
  - Add checkbox list
  - Allow multiple selections
  - Add search within providers
- [x] 10.6 Add bands filter
  - Add checkboxes for RGB, NIR, Red-Edge, etc.
  - Allow multiple selections
- [x] 10.7 Add image type filter
  - Add radio buttons for Optical, Radar, Thermal
  - Allow single selection
- [x] 10.8 Add filter management
  - Add "Clear All Filters" button
  - Show active filter count
  - Display active filters as badges
  - Allow removing individual filters
- [x] 10.9 Integrate with request form
  - Pass filter state to request form
  - Include filters in request submission
  - Display filters in request summary

### 11. Frontend - Product Catalog
- [x] 11.1 Create ProductCatalog component
  - Create grid layout for product cards
  - Add loading state
  - Add empty state
  - Add pagination controls
- [x] 11.2 Create ProductCard component
  - Display product name and provider
  - Display resolution and bands
  - Display sample image thumbnail
  - Add hover effects
  - Add "View Details" button
- [x] 11.3 Create ProductDetailModal
  - Display full product specifications
  - Display larger sample image
  - Display availability info
  - Display pricing info
  - Add "Request This Product" button
- [x] 11.4 Add product filtering
  - Connect to FilterPanel state
  - Filter products by resolution
  - Filter products by sensor type
  - Filter products by provider
  - Update product list on filter change
- [x] 11.5 Add product sorting
  - Add sort dropdown (Resolution, Name, Provider)
  - Implement sorting logic
  - Update URL params for sorting
- [x] 11.6 Add pagination
  - Implement page navigation
  - Add page size selector (20, 50, 100)
  - Update URL params for pagination
  - Scroll to top on page change

### 12. UI Enhancements
- [x] 12.1 Add loading states
  - Add skeleton loaders for products
  - Add spinner for map loading
  - Add progress indicator for form submission
- [x] 12.2 Add error states
  - Add error messages for API failures
  - Add retry buttons
  - Add fallback UI
- [x] 12.3 Add tooltips
  - Add help tooltips for drawing tools
  - Add info tooltips for filters
  - Add tooltips for technical terms
- [x] 12.4 Add animations
  - Add fade-in for components
  - Add slide-in for filter panel
  - Add smooth transitions
  - Use framer-motion (existing)

## Phase 3: User Features

### 13. Backend API - Saved AOIs
- [x] 13.1 Create saved AOI routes
  - GET /api/user/saved-aois (list user's AOIs)
  - POST /api/user/saved-aois (save new AOI)
  - PUT /api/user/saved-aois/:id (update AOI name/description)
  - DELETE /api/user/saved-aois/:id (delete AOI)
  - Require authentication
- [x] 13.2 Add AOI validation
  - Validate AOI coordinates
  - Validate name length
  - Check for duplicate names per user
  - Limit number of saved AOIs per user (e.g., 50)

### 14. Frontend - Saved AOIs
- [x] 14.1 Add "Save AOI" functionality to map
  - Add "Save AOI" button when AOI is drawn
  - Show save dialog with name input
  - Submit to API
  - Show success/error message
- [x] 14.2 Create SavedAOIsList component
  - Display list of user's saved AOIs
  - Show AOI name, area, date saved
  - Add "Load" button for each AOI
  - Add "Delete" button for each AOI
  - Add search/filter for AOIs
- [x] 14.3 Add AOI loading functionality
  - Load AOI coordinates on "Load" click
  - Draw AOI on map
  - Center map on AOI
  - Update current AOI state
- [x] 14.4 Integrate with Explorer page
  - Add "My AOIs" panel/dropdown
  - Show saved AOIs list
  - Allow quick loading of saved AOIs

### 15. Frontend - User Dashboard
- [x] 15.1 Create UserImageryDashboard page
  - Create page layout
  - Add navigation tabs (Requests, Saved AOIs)
  - Add route /dashboard/imagery
  - Require authentication
- [x] 15.2 Create RequestHistoryTable component
  - Display user's imagery requests
  - Show request date, status, AOI area
  - Add status badges with colors
  - Add "View Details" button
  - Add pagination
- [x] 15.3 Create RequestDetailModal
  - Display full request details
  - Show AOI on small map
  - Show filters and date range
  - Show status history
  - Show admin notes (if any)
  - Show quote (if provided)
- [x] 15.4 Add request filtering
  - Filter by status
  - Filter by date range
  - Add search by request ID
- [x] 15.5 Integrate SavedAOIsList
  - Add saved AOIs tab
  - Display SavedAOIsList component
  - Add "Use in Explorer" button

### 16. User Experience Improvements
- [x] 16.1 Add request status tracking
  - Show status timeline
  - Show status change dates
  - Add email notifications for status changes
- [x] 16.2 Add request cancellation
  - Add "Cancel Request" button (for pending requests)
  - Confirm cancellation
  - Update status to cancelled
- [x] 16.3 Add request duplication
  - Add "Duplicate Request" button
  - Pre-fill form with existing request data
  - Allow modifications before submission

## Phase 4: Admin Features

### 17. Admin - Product Management
- [x] 17.1 Create AdminProductsPage
  - Create page layout
  - Add route /admin/satellite-products
  - Require admin authentication
- [x] 17.2 Create ProductsTable component
  - Display all products (including inactive)
  - Show name, provider, resolution, status
  - Add status toggle (active/inactive)
  - Add "Edit" and "Delete" buttons
  - Add search and filters
- [x] 17.3 Create ProductForm component
  - Create form for adding/editing products
  - Add all product fields
  - Add image upload for sample image
  - Add validation
  - Support create and update modes
- [x] 17.4 Add product management actions
  - Implement create product
  - Implement update product
  - Implement delete product (with confirmation)
  - Implement bulk actions (activate/deactivate multiple)

### 18. Admin - Request Management
- [x] 18.1 Create AdminImageryRequestsPage
  - Create page layout
  - Add route /admin/imagery-requests
  - Require admin authentication
- [x] 18.2 Create RequestsTable component
  - Display all imagery requests
  - Show request date, user, status, AOI area
  - Add status badges
  - Add "View Details" button
  - Add pagination
  - Add sorting
- [x] 18.3 Create RequestDetailPanel component
  - Display full request details
  - Show AOI on interactive map
  - Show user contact information
  - Show filters and requirements
  - Add status update form
  - Add admin notes textarea
  - Add quote input fields
- [x] 18.4 Add request filtering
  - Filter by status
  - Filter by date range
  - Filter by user
  - Filter by urgency
  - Add search by request ID or user email
- [x] 18.5 Add status update functionality
  - Update request status
  - Add admin notes
  - Add quote amount and currency
  - Send email notification to user on status change
  - Track status change history
- [x] 18.6 Add export functionality
  - Export requests as CSV
  - Include all request details
  - Filter exported data
  - Add date range for export

### 19. Admin - Analytics Dashboard
- [x] 19.1 Create analytics overview
  - Show total requests count
  - Show requests by status (pie chart)
  - Show requests over time (line chart)
  - Show popular products
  - Show average AOI size
- [x] 19.2 Add request metrics
  - Calculate average response time
  - Calculate conversion rate (pending → approved)
  - Show requests by urgency
  - Show requests by user type (guest vs registered)

## Phase 5: Advanced Features

### 20. File Upload Support
- [ ] 20.1 Add file upload to backend
  - Create upload endpoint for KML/GeoJSON
  - Validate file types
  - Limit file size (5MB)
  - Parse KML files using @tmcw/togeojson
  - Parse GeoJSON files
  - Return parsed coordinates
- [ ] 20.2 Add file upload to frontend
  - Add file upload button to map
  - Add drag-and-drop support
  - Show file name and size
  - Display parsed geometry on map
  - Handle parsing errors
  - Add file format help text
- [ ] 20.3 Add file download
  - Add "Download AOI" button
  - Export current AOI as GeoJSON
  - Export current AOI as KML
  - Trigger file download

### 21. Circle Drawing Tool
- [ ] 21.1 Add circle drawing to Leaflet
  - Add circle drawing tool to toolbar
  - Capture circle center and radius
  - Convert circle to polygon for storage
  - Display radius in kilometers
  - Add edit functionality for circle

### 22. Advanced Geocoding
- [ ] 22.1 Enhance geocoding service
  - Add reverse geocoding (coordinates → place name)
  - Add autocomplete suggestions
  - Add recent searches storage
  - Add favorite locations
  - Support multiple geocoding providers

### 23. Mobile Optimization
- [ ] 23.1 Optimize map for mobile
  - Improve touch interactions
  - Optimize drawing tools for touch
  - Add mobile-specific controls
  - Improve performance on mobile devices
- [ ] 23.2 Optimize UI for mobile
  - Make filter panel mobile-friendly
  - Optimize product catalog for mobile
  - Improve form layout for mobile
  - Add mobile-specific navigation

### 24. Performance Optimization
- [ ] 24.1 Optimize map performance
  - Implement tile caching
  - Lazy load map components
  - Optimize drawing performance
  - Reduce bundle size
- [ ] 24.2 Optimize API performance
  - Add caching for product catalog
  - Optimize database queries
  - Add database indexes
  - Implement API response compression
- [ ] 24.3 Optimize frontend performance
  - Code splitting
  - Lazy load routes
  - Optimize images
  - Minimize bundle size
  - Add service worker for offline support

### 25. Documentation & Help
- [ ] 25.1 Create user guide
  - Write guide for drawing AOIs
  - Write guide for using filters
  - Write guide for submitting requests
  - Add screenshots and videos
- [ ] 25.2 Add in-app help
  - Add help tooltips
  - Add tutorial overlay for first-time users
  - Add FAQ section
  - Add contact support link
- [ ] 25.3 Create admin guide
  - Write guide for managing products
  - Write guide for managing requests
  - Write guide for using analytics

## Testing & Quality Assurance

### 26. Testing
- [ ] 26.1 Write unit tests
  - Test utility functions (area calculation, coordinate conversion)
  - Test form validation
  - Test API request/response handling
  - Test component rendering
- [ ] 26.2 Write integration tests
  - Test API endpoints
  - Test database operations
  - Test email notifications
  - Test file upload/parsing
- [ ] 26.3 Write E2E tests
  - Test complete user flow (draw AOI → submit request)
  - Test admin workflow
  - Test saved AOI workflow
  - Test mobile responsiveness
- [ ] 26.4 Manual testing
  - Test cross-browser compatibility (Chrome, Firefox, Safari, Edge)
  - Test on different devices
  - Test accessibility with screen readers
  - Test keyboard navigation

### 27. Bug Fixes & Polish
- [ ] 27.1 Fix identified bugs
  - Review and fix bug reports
  - Test edge cases
  - Handle error scenarios
- [ ] 27.2 Polish UI/UX
  - Refine animations
  - Improve loading states
  - Enhance error messages
  - Improve accessibility
- [ ] 27.3 Performance tuning
  - Optimize slow queries
  - Reduce bundle size
  - Improve map performance
  - Optimize images

## Deployment

### 28. Deployment Preparation
- [ ] 28.1 Environment configuration
  - Set up production environment variables
  - Configure map tile provider
  - Configure geocoding service
  - Configure email service
- [ ] 28.2 Database migration
  - Run database migrations
  - Seed production data
  - Set up database backups
- [ ] 28.3 Documentation
  - Update API documentation
  - Update deployment guide
  - Update user guide
  - Update admin guide
- [ ] 28.4 Monitoring setup
  - Set up error logging
  - Set up performance monitoring
  - Set up analytics
  - Set up alerts
