# Implementation Plan: Earth Intelligence Platform Website

## Overview

This implementation plan breaks down the Earth Intelligence Platform into three phases:
- **Phase 1**: Foundation & Homepage (core navigation, hero, carousels, static content)
- **Phase 2**: Additional Pages (Products, Industries, Pricing, Partners, About, Blog, Specs)
- **Phase 3**: Backend Integration (authentication, CMS, forms, user management)

Each task builds incrementally, with testing integrated throughout. The plan follows a mobile-first approach using React/TypeScript, Vite, Tailwind CSS, shadcn/ui, and Framer Motion. Phase 3 backend uses Node.js/Express with MongoDB for data persistence, JWT authentication, and email notifications.

## Tasks

### Phase 1: Foundation & Homepage

- [x] 1. Project setup and configuration
  - Initialize Vite project with React and TypeScript
  - Configure Tailwind CSS with dark theme colors (navy/black backgrounds, white text, gold/yellow accents)
  - Install and configure shadcn/ui components
  - Install Framer Motion for animations
  - Set up React Router for navigation
  - Configure ESLint and Prettier
  - Create basic folder structure (components/, pages/, lib/, hooks/, types/)
  - _Requirements: 4.1_

- [x] 2. Core layout components
  - [x] 2.1 Create Navigation component with sticky positioning
    - Implement logo, menu links (Products, Industries, Specs, Pricing, Partners)
    - Add Industries dropdown with sub-items
    - Implement transparent-to-solid background transition on scroll
    - Add CTA buttons (Book Demo, Sign In)
    - _Requirements: 3.1.1, 3.1.2, 3.1.3, 3.1.5_
  
  - [ ]* 2.2 Write property test for navigation sticky behavior
    - **Property 2: Sticky Navigation Visibility**
    - **Validates: Requirements 3.1.1**
  
  - [ ]* 2.3 Write property test for navigation routing
    - **Property 1: Navigation Link Routing**
    - **Validates: Requirements 3.1.6**
  
  - [x] 2.4 Create mobile hamburger menu with slide-in drawer
    - Implement touch-friendly menu
    - Add backdrop with fade animation
    - Handle close on backdrop click or swipe
    - _Requirements: 3.1.4_
  
  - [x] 2.5 Create Footer component
    - Multi-column layout with organized links
    - Social media icons
    - Newsletter signup form
    - Legal links (Privacy Policy, Terms of Service)
    - _Requirements: 3.10.1, 3.10.2, 3.10.4_
  
  - [x] 2.6 Create Layout wrapper component
    - Integrate Navigation and Footer
    - Set up React Router Outlet for page content
    - _Requirements: 3.1.1_


- [x] 3. Animation system and reusable components
  - [x] 3.1 Create animation utility components
    - FadeIn component with scroll trigger support
    - SlideUp component with configurable direction
    - Stagger container for sequential animations
    - Respect prefers-reduced-motion media query
    - _Requirements: 3.24.3, 3.25.3_
  
  - [x] 3.2 Create Marquee component for logo scrolling
    - Implement continuous horizontal scroll
    - Add pause on hover
    - Ensure seamless looping without gaps
    - _Requirements: 3.3.1, 3.3.3_
  
  - [ ]* 3.3 Write property test for carousel infinite loop
    - **Property 5: Carousel Infinite Loop**
    - **Validates: Requirements 3.3.3**
  
  - [x] 3.4 Create Carousel component with touch/swipe support
    - Implement slide transitions
    - Add navigation dots/arrows
    - Support auto-play with configurable interval
    - Handle touch gestures for mobile
    - _Requirements: 3.4.1, 3.4.3, 3.4.4, 3.4.5_
  
  - [ ]* 3.5 Write property test for swipe gesture navigation
    - **Property 6: Swipe Gesture Navigation**
    - **Validates: Requirements 3.4.4, 3.5.4**

- [x] 4. Hero section implementation
  - [x] 4.1 Create HeroSection component
    - Full-screen layout with dark background
    - Satellite imagery background with subtle parallax
    - Main heading with fade-in animation
    - CTA button with hover effects
    - _Requirements: 3.2.1, 3.2.3, 3.2.4_
  
  - [x] 4.2 Implement CoordinatesOverlay with typing animation
    - Character-by-character reveal effect
    - Configurable typing speed (50ms per character)
    - _Requirements: 3.2.2_
  
  - [ ]* 4.3 Write property test for typing animation
    - **Property 4: Typing Animation Character Sequence**
    - **Validates: Requirements 3.2.2**
  
  - [x] 4.4 Create animated satellite detection boxes
    - Floating animation with random positions
    - 3-5 second duration per animation cycle
    - _Requirements: 3.2.5_

- [x] 5. Homepage sections - Part 1
  - [x] 5.1 Create TrustedBySection with partner logos
    - Implement auto-scrolling marquee
    - Use Marquee component from task 3.2
    - _Requirements: 3.3.1, 3.3.2, 3.3.3_
  
  - [x] 5.2 Create ProductCard component
    - Display image, pricing badge, title, description
    - Add CTA links
    - Implement hover scale effect
    - _Requirements: 3.4.2_
  
  - [ ]* 5.3 Write property test for product card completeness
    - **Property 8: Product Card Completeness**
    - **Validates: Requirements 3.4.2**
  
  - [x] 5.4 Create ProductsSection with carousel
    - Horizontal scrollable carousel of ProductCard components
    - Use Carousel component from task 3.4
    - Add sample product data
    - _Requirements: 3.4.1, 3.4.3, 3.4.4, 3.4.5_


- [x] 6. Homepage sections - Part 2
  - [x] 6.1 Create IndustryTabs component
    - Tab navigation for all 8 industries (Financial Services, Agriculture, Energy, Mining, Construction, Government, Environment, Insurance)
    - Active tab visual indicator with slide animation
    - Swipe support for mobile
    - _Requirements: 3.5.1, 3.5.4, 3.5.5_
  
  - [x] 6.2 Create IndustryContent component
    - Display industry-specific imagery and description
    - Fade transition when switching tabs
    - _Requirements: 3.5.2, 3.5.3_
  
  - [ ]* 6.3 Write property test for industry tab content display
    - **Property 7: Industry Tab Content Display**
    - **Validates: Requirements 3.5.2**
  
  - [x] 6.4 Create IndustriesSection combining tabs and content
    - Wire together IndustryTabs and IndustryContent
    - Add sample industry data
    - _Requirements: 3.5.1, 3.5.2, 3.5.3, 3.5.4, 3.5.5_

- [ ] 7. Homepage sections - Part 3
  - [x] 7.1 Create PricingHighlights section
    - Feature grid with icons (Comprehensive Coverage, High Precision, Cost-Effective, etc.)
    - CTA buttons linking to pricing page
    - Ensure visibility on dark background
    - _Requirements: 3.6.1, 3.6.2_
  
  - [x] 7.2 Create PartnersGrid component
    - Grid layout for satellite/data partner logos
    - Hover scale effects on each logo
    - Responsive grid (1 col mobile, 3 cols tablet, 4+ cols desktop)
    - _Requirements: 3.7.1, 3.7.2, 3.7.3_
  
  - [ ]* 7.3 Write property test for responsive grid layout
    - **Property 9: Responsive Layout Adaptation**
    - **Validates: Requirements 3.24.5**
  
  - [x] 7.4 Create AboutPreview section
    - Three InfoCard components with images and descriptions
    - Scroll-triggered fade-in animations
    - Responsive stacking on mobile
    - _Requirements: 3.8.1, 3.8.2, 3.8.3_
  
  - [x] 7.5 Create BlogSection component
    - Display latest 3 ArticleCard components
    - Each card shows image, title, date
    - Link to full blog page
    - Cards clickable and route to individual posts
    - _Requirements: 3.9.1, 3.9.2, 3.9.3_

- [x] 8. Assemble HomePage and configure routing
  - [x] 8.1 Create HomePage component
    - Assemble all homepage sections in order
    - Ensure smooth scroll behavior
    - _Requirements: 2.1_
  
  - [x] 8.2 Configure React Router
    - Set up routes for HomePage and placeholder pages
    - Implement Layout wrapper
    - Add 404 page
    - _Requirements: 3.1.6_
  
  - [x] 8.3 Implement lazy loading for images
    - Add loading="lazy" to all below-fold images
    - Configure intersection observer threshold
    - _Requirements: 3.25.2_
  
  - [ ]* 8.4 Write property test for lazy image loading
    - **Property 10: Lazy Image Loading**
    - **Validates: Requirements 3.25.2**

- [x] 9. Checkpoint - Phase 1 Complete
  - Ensure all tests pass
  - Verify responsive behavior on mobile, tablet, desktop
  - Test all animations and interactions
  - Check accessibility with keyboard navigation
  - Ask the user if questions arise


### Phase 2: Additional Pages

- [x] 10. Products pages
  - [x] 10.1 Create ProductsPage with full product listing
    - Display all 9 products (Analytics, Commercial Imagery, Open Data, Vantor, Maxar Connect, AIS Data, ATAK Plugin, ICEYE US, Planet Select)
    - Use ProductCard components in grid layout
    - _Requirements: 3.11.1, 3.11.2_
  
  - [ ]* 10.2 Write property test for product detail routing
    - **Property 3: Product Detail Routing**
    - **Validates: Requirements 3.11.3**
  
  - [x] 10.3 Create ProductDetailPage component
    - Product hero section
    - Features section with icons
    - Use cases section
    - CTAs for booking demo or inquiry
    - _Requirements: 3.11.4_
  
  - [x] 10.4 Create product detail pages for all 9 products
    - Generate routes for each product
    - Populate with product-specific content
    - _Requirements: 3.11.3, 3.11.4_

- [x] 11. Industries pages
  - [x] 11.1 Create IndustriesPage overview
    - List all 8 industries with cards
    - Each card links to individual industry page
    - _Requirements: 3.12.1_
  
  - [x] 11.2 Create IndustryDetailPage component
    - Industry hero with relevant imagery
    - Use cases section
    - CTAs for contact or demo
    - _Requirements: 3.12.3_
  
  - [x] 11.3 Create industry detail pages for all 8 industries
    - Generate routes for each industry
    - Populate with industry-specific content
    - _Requirements: 3.12.2, 3.12.3_

- [ ] 12. Pricing page
  - [x] 12.1 Create PricingCalculator component
    - Interactive inputs for data type, coverage area, frequency
    - Calculate and display pricing
    - _Requirements: 3.13.1_
  
  - [ ]* 12.2 Write property test for pricing calculator validity
    - **Property 20: Pricing Calculator Validity**
    - **Validates: Requirements 3.13.1**
  
  - [x] 12.3 Create PlanComparison component
    - Comparison table for different plans
    - Highlight differences and features
    - _Requirements: 3.13.2_
  
  - [x] 12.4 Create PricingFAQ component
    - Accordion for common questions
    - Expand/collapse functionality
    - _Requirements: 3.13.3_
  
  - [x] 12.5 Create PricingPage assembling all components
    - Wire together calculator, comparison, and FAQ
    - Add data type comparison section
    - _Requirements: 3.13.1, 3.13.2, 3.13.3, 3.13.4_

- [x] 13. Partners, About, and Specs pages
  - [x] 13.1 Create PartnersPage
    - Partner directory with all partners
    - Each partner card shows logo, description, link
    - Organize by category (satellite, data, technology, client)
    - _Requirements: 3.14.1, 3.14.2_
  
  - [x] 13.2 Create AboutPage
    - Company story and mission section
    - Team section with key personnel
    - Timeline/milestones section
    - _Requirements: 3.15.1, 3.15.2, 3.15.3_
  
  - [x] 13.3 Create SpecsPage
    - Technical specifications table
    - Comparison table showing resolution, revisit time, coverage
    - Organize by satellite/data type
    - _Requirements: 3.17.1, 3.17.2_


- [x] 14. Blog pages
  - [x] 14.1 Create BlogPage with article listing
    - Display all blog posts in grid
    - Show image, title, excerpt, date for each post
    - _Requirements: 3.16.1_
  
  - [x] 14.2 Implement blog search/filter functionality
    - Search input that filters by title, excerpt, tags
    - Display filtered results
    - _Requirements: 3.16.2_
  
  - [ ]* 14.3 Write property test for blog search filtering
    - **Property 19: Blog Search Filtering**
    - **Validates: Requirements 3.16.2**
  
  - [x] 14.4 Create BlogPostPage component
    - Post hero with featured image
    - Rich content rendering with formatting
    - Post metadata (author, date, tags)
    - _Requirements: 3.16.3, 3.16.4_
  
  - [x] 14.5 Create sample blog posts
    - Add 5-10 sample blog posts with content
    - Include images and formatted text
    - _Requirements: 3.9.1, 3.16.1_

- [x] 15. Cookie consent and newsletter form
  - [x] 15.1 Create CookieConsent component
    - Banner displays on first visit
    - Accept/decline buttons
    - Store preference in localStorage
    - _Requirements: 3.10.5_
  
  - [x] 15.2 Implement NewsletterForm functionality
    - Email validation
    - Form submission handling (placeholder for Phase 3)
    - Success/error messages
    - _Requirements: 3.10.3_
  
  - [ ]* 15.3 Write property test for email validation
    - **Property 11: Email Validation**
    - **Validates: Requirements 3.23.1, 3.20.3**

- [x] 16. Checkpoint - Phase 2 Complete
  - Ensure all pages are accessible via navigation
  - Test all links and routing
  - Verify responsive design on all pages
  - Check page load performance
  - Ask the user if questions arise


### Phase 3: Backend Integration

- [ ] 17. Backend setup and configuration
  - [ ] 17.1 Set up Node.js/Express backend project
    - Initialize Node.js project with npm init
    - Install dependencies: express, mongoose, bcrypt, jsonwebtoken, cors, dotenv
    - Create server.js with Express app configuration
    - Configure CORS for frontend origin
    - Set up error handling middleware
    - _Requirements: 4.2_
  
  - [ ] 17.2 Configure MongoDB connection
    - Install Mongoose ODM
    - Create MongoDB connection in server.js
    - Set up environment variables (MONGODB_URI, JWT_SECRET, etc.)
    - Test database connection
    - _Requirements: 4.2_
  
  - [ ] 17.3 Create Mongoose schemas and models
    - Create models/UserProfile.js with schema and indexes
    - Create models/DemoBooking.js with schema and indexes
    - Create models/ContactInquiry.js with schema
    - Create models/ProductInquiry.js with schema
    - Create models/NewsletterSubscription.js with unique email index
    - Create models/BlogPost.js with slug index
    - _Requirements: 4.2_
  
  - [ ] 17.4 Create authentication middleware
    - Create middleware/auth.js with requireAuth function
    - Implement JWT token verification
    - Create requireAdmin middleware for role-based access
    - Test middleware with sample routes
    - _Requirements: 4.2_
  
  - [ ] 17.5 Set up file upload service
    - Install multer for file handling
    - Install AWS SDK (@aws-sdk/client-s3) or Cloudinary SDK
    - Create routes/upload.js for image uploads
    - Configure S3 bucket or Cloudinary cloud
    - Implement upload and delete endpoints
    - _Requirements: 4.2_
  
  - [ ] 17.6 Set up email service
    - Install nodemailer or @sendgrid/mail
    - Create services/email.js with sendEmail function
    - Configure SMTP settings or SendGrid API key
    - Create email templates for confirmations
    - Test email sending
    - _Requirements: 4.2_
  
  - [ ] 17.7 Create frontend API client
    - Update API client with MongoDB _id field handling
    - Implement authentication token management
    - Create request/response type definitions
    - Add error handling for API calls
    - _Requirements: 4.2_

- [ ] 18. Authentication system
  - [ ] 18.1 Create authentication routes
    - Create routes/auth.js with Express router
    - Implement POST /auth/signup endpoint with bcrypt password hashing
    - Implement POST /auth/signin endpoint with JWT generation
    - Implement GET /auth/me endpoint for current user
    - Implement POST /auth/signout endpoint
    - _Requirements: 3.18.1, 3.18.2_
  
  - [ ] 18.2 Create AuthContext and AuthProvider
    - Implement user state management with React Context
    - Handle session persistence with localStorage
    - Listen for auth state changes
    - Implement signUp, signIn, signOut functions
    - _Requirements: 3.18.1, 3.18.2_
  
  - [ ]* 18.3 Write property test for authentication round trip
    - **Property 14: Authentication Round Trip**
    - **Validates: Requirements 3.18.1, 3.18.2**
  
  - [ ] 18.4 Create SignUpPage component
    - Email and password inputs with validation
    - Form submission with error handling
    - Success redirect to dashboard
    - _Requirements: 3.18.1_
  
  - [ ] 18.5 Create SignInPage component
    - Email and password inputs with validation
    - Form submission with error handling
    - Success redirect to dashboard
    - _Requirements: 3.18.2_
  
  - [ ] 18.6 Implement protected routes
    - Create ProtectedRoute wrapper component
    - Check authentication status from AuthContext
    - Redirect to sign-in if not authenticated
    - _Requirements: 3.18.5_
  
  - [ ]* 18.7 Write property test for role-based access control
    - **Property 16: Role-Based Access Control**
    - **Validates: Requirements 3.18.5**


- [ ] 19. User dashboard
  - [ ] 19.1 Create user dashboard routes
    - Create routes/users.js with Express router
    - Implement GET /api/users/:id/profile endpoint
    - Implement PUT /api/users/:id/profile endpoint
    - Implement GET /api/users/:id/bookings endpoint
    - Implement GET /api/users/:id/inquiries endpoint
    - Add requireAuth middleware to all routes
    - _Requirements: 3.18.4, 3.22.2, 3.22.3_
  
  - [ ] 19.2 Create DashboardPage component
    - User profile section with edit capability
    - Order/inquiry history display
    - Demo bookings list
    - Protected route (requires authentication)
    - _Requirements: 3.18.4, 3.22.2, 3.22.3_
  
  - [ ] 19.3 Implement user profile management
    - Display user information from MongoDB
    - Edit profile form with validation
    - Update user preferences
    - _Requirements: 3.18.4_
  
  - [ ] 19.4 Create order history display
    - Fetch and display user's product inquiries from MongoDB
    - Show status updates
    - _Requirements: 3.22.2, 3.22.3, 3.22.4_

- [ ] 20. Demo booking system
  - [ ] 20.1 Create demo booking routes
    - Create routes/bookings.js with Express router
    - Implement POST /api/bookings endpoint
    - Implement GET /api/bookings/user/:userId endpoint
    - Store submissions in MongoDB using DemoBooking model
    - _Requirements: 3.19.1, 3.19.2_
  
  - [ ] 20.2 Create DemoBookingForm component
    - Form fields: name, email, company, phone, date, time, message
    - Date/time picker integration
    - Form validation
    - _Requirements: 3.19.1_
  
  - [ ]* 20.3 Write property test for data persistence round trip
    - **Property 15: Data Persistence Round Trip**
    - **Validates: Requirements 3.19.2**
  
  - [ ] 20.4 Implement email notification service
    - Use Nodemailer or SendGrid in services/email.js
    - Create email templates for confirmations
    - Send confirmation emails to users on booking creation
    - _Requirements: 3.19.3, 3.19.4_
  
  - [ ] 20.5 Wire demo booking form to "Book a Demo" CTAs
    - Update all "Book a Demo" buttons to open form modal
    - Handle form submission to POST /api/bookings
    - Show success/error messages
    - _Requirements: 3.19.1, 3.19.2, 3.19.3, 3.19.4_

- [ ] 21. Contact and inquiry forms
  - [ ] 21.1 Create contact and inquiry routes
    - Create routes/inquiries.js with Express router
    - Implement POST /api/inquiries endpoint for contact inquiries
    - Implement POST /api/inquiries/product endpoint for product inquiries
    - Store submissions in MongoDB using ContactInquiry and ProductInquiry models
    - _Requirements: 3.20.1, 3.20.2, 3.22.1_
  
  - [ ] 21.2 Create ContactForm component
    - General contact form with validation
    - Form fields: name, email, company, subject, message
    - _Requirements: 3.20.1_
  
  - [ ] 21.3 Create PartnershipInquiryForm component
    - Partnership-specific form
    - Additional fields for partnership type
    - _Requirements: 3.20.2_
  
  - [ ] 21.4 Create ProductInquiryForm component
    - Product-specific inquiry form
    - Link to specific products
    - _Requirements: 3.22.1_
  
  - [ ] 21.5 Implement form validation
    - Validate required fields
    - Prevent invalid submissions
    - Display field-specific errors
    - _Requirements: 3.20.3_
  
  - [ ]* 21.6 Write property test for form validation rejection
    - **Property 12: Form Validation Rejection**
    - **Validates: Requirements 3.20.3**
  
  - [ ] 21.7 Wire forms to backend API
    - Connect form submissions to POST /api/inquiries
    - Show success/error messages
    - Clear forms on success
    - _Requirements: 3.20.1, 3.20.2, 3.22.1_


- [ ] 22. Newsletter subscription system
  - [ ] 22.1 Create newsletter routes
    - Create routes/newsletter.js with Express router
    - Implement POST /api/newsletter/subscribe endpoint
    - Implement POST /api/newsletter/unsubscribe endpoint
    - Store email in MongoDB using NewsletterSubscription model
    - Handle duplicate emails gracefully (return success if already subscribed)
    - _Requirements: 3.23.1, 3.23.2, 3.23.3_
  
  - [ ]* 22.2 Write property test for duplicate email handling
    - **Property 13: Duplicate Email Handling**
    - **Validates: Requirements 3.23.3**
  
  - [ ] 22.3 Wire NewsletterForm to API
    - Connect form submission to POST /api/newsletter/subscribe
    - Show success/error messages
    - Clear form on success
    - _Requirements: 3.10.3, 3.23.1, 3.23.2_
  
  - [ ] 22.4 Implement unsubscribe functionality
    - Create unsubscribe page/link
    - Update subscription status in MongoDB
    - _Requirements: 3.23.4_

- [ ] 23. Blog CMS (Admin only)
  - [ ] 23.1 Create blog admin routes
    - Create routes/admin/blog.js with Express router
    - Implement GET /api/admin/blog/posts endpoint (all posts)
    - Implement POST /api/admin/blog/posts endpoint (create post)
    - Implement PUT /api/admin/blog/posts/:id endpoint (update post)
    - Implement DELETE /api/admin/blog/posts/:id endpoint (delete post)
    - Add requireAuth and requireAdmin middleware to all routes
    - Store posts in MongoDB using BlogPost model
    - _Requirements: 3.21.1, 3.21.4, 3.21.5_
  
  - [ ] 23.2 Create AdminCMSPage component
    - Protected route (admin role required)
    - List all blog posts (published and drafts) from MongoDB
    - Create/edit/delete actions
    - _Requirements: 3.21.1, 3.21.5_
  
  - [ ] 23.3 Create BlogPostEditor component
    - Rich text editor integration (e.g., TipTap or Quill)
    - Support formatting (bold, italic, lists, links, headings)
    - Title, excerpt, and content fields
    - Tags input
    - Featured image upload
    - _Requirements: 3.21.1, 3.21.2_
  
  - [ ]* 23.4 Write property test for rich text formatting preservation
    - **Property 18: Rich Text Formatting Preservation**
    - **Validates: Requirements 3.21.2**
  
  - [ ] 23.5 Implement image upload functionality
    - Upload images to S3/Cloudinary via POST /api/upload
    - Return public URL
    - Display uploaded images in editor
    - _Requirements: 3.21.3_
  
  - [ ]* 23.6 Write property test for image upload round trip
    - **Property 17: Image Upload Round Trip**
    - **Validates: Requirements 3.21.3**
  
  - [ ] 23.7 Wire blog post editor to backend
    - Connect create/update/delete actions to admin API endpoints
    - Handle MongoDB _id field in responses
    - Toggle published/draft status
    - _Requirements: 3.21.1, 3.21.4_
  
  - [ ] 23.8 Create InquiryManager component
    - Display all contact inquiries and demo bookings from MongoDB
    - Filter by status
    - Update status via API
    - Admin-only access
    - _Requirements: 3.20.4_


- [ ] 24. Connect blog pages to backend
  - [ ] 24.1 Update BlogPage to fetch from MongoDB
    - Replace static data with API call to GET /api/blog/posts
    - Implement loading states
    - Handle errors gracefully
    - _Requirements: 3.16.1_
  
  - [ ] 24.2 Update BlogPostPage to fetch from MongoDB
    - Fetch post by slug using GET /api/blog/posts/:slug
    - Display rich content with formatting
    - Handle post not found (404)
    - _Requirements: 3.16.3, 3.16.4_
  
  - [ ] 24.3 Update BlogSection on homepage
    - Fetch latest 3 posts from MongoDB
    - Display with ArticleCard components
    - _Requirements: 3.9.1_

- [ ] 25. Performance optimization and accessibility
  - [ ] 25.1 Implement code splitting for routes
    - Lazy load all page components
    - Add Suspense boundaries with loading states
    - _Requirements: 3.25.1_
  
  - [ ] 25.2 Optimize images
    - Convert images to WebP format
    - Implement responsive images with srcSet
    - Compress images (quality 80-85%)
    - _Requirements: 3.25.2_
  
  - [ ] 25.3 Add accessibility features
    - Ensure all interactive elements have ARIA labels
    - Implement keyboard navigation
    - Add skip to main content link
    - Test with screen reader
    - Verify color contrast meets WCAG AA
    - _Requirements: 3.25.4, 3.25.5, 3.25.6_
  
  - [ ] 25.4 Implement error boundaries
    - Create ErrorBoundary component
    - Wrap app with error boundary
    - Display user-friendly error messages
    - Log errors to console
    - _Requirements: 6.3_

- [ ] 26. Testing and quality assurance
  - [ ]* 26.1 Run all property-based tests
    - Verify all 20 properties pass with 100+ iterations
    - Fix any failing tests
    - _Requirements: All correctness properties_
  
  - [ ]* 26.2 Write integration tests for critical flows
    - Test authentication flow (sign up, sign in, sign out)
    - Test demo booking flow
    - Test contact form submission
    - Test blog post creation and publishing
    - _Requirements: 3.18.1, 3.18.2, 3.19.1, 3.20.1, 3.21.1_
  
  - [ ] 26.3 Performance testing
    - Run Lighthouse audit
    - Verify page load time < 3 seconds
    - Verify FCP < 1.5 seconds
    - Verify TTI < 3 seconds
    - Optimize if needed
    - _Requirements: 3.25.1, 6.2_
  
  - [ ] 26.4 Cross-browser testing
    - Test on Chrome, Firefox, Safari, Edge (last 2 versions)
    - Verify all features work correctly
    - Fix browser-specific issues
    - _Requirements: 5.1_

- [ ] 27. Final checkpoint and deployment preparation
  - Ensure all tests pass
  - Verify all features work end-to-end
  - Check responsive design on all devices
  - Verify accessibility compliance
  - Review security (access control policies, input validation)
  - Prepare deployment checklist
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at phase boundaries
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end user flows
- Phase 1 focuses on frontend foundation and homepage
- Phase 2 adds all additional pages with static content
- Phase 3 integrates Node.js/Express backend with MongoDB for full functionality


### Phase 2.5: Missing Pages Implementation (Completed)

- [x] 20. Set up validation schemas and shared utilities
  - [x] 20.1 Create Zod validation schemas for all forms
    - Create bookDemoSchema, signInSchema, signUpSchema, forgotPasswordSchema, contactSchema, quoteSchema
    - Define TypeScript interfaces for form data types
    - Centralize schemas in src/lib/form-schemas.ts
    - _Requirements: 8.10.1, 8.10.2_
  
  - [x] 20.2 Create shared form submission handler utility
    - Implement handleFormSubmission in src/lib/form-utils.ts
    - Add toast notification support
    - Add loading state management
    - Prepare for Phase 3 backend integration
    - _Requirements: 8.10.4, 8.10.5_

- [x] 21. Implement Book Demo Page
  - [x] 21.1 Create BookDemoPage component with form
    - Create src/pages/BookDemoPage.tsx
    - Implement form with React Hook Form and Zod validation
    - Add fields: fullName, email, companyName, phoneNumber, jobTitle, message
    - Add "Request Demo" submit button with loading state
    - Implement form submission handler with toast notifications
    - Style with shadcn/ui Card, Input, Textarea, Button components
    - Make responsive with Tailwind CSS (mobile, tablet, desktop)
    - _Requirements: 8.1.1, 8.1.2, 8.1.3, 8.1.4, 8.1.5, 8.1.6, 8.1.7, 8.1.8_

- [x] 22. Implement Sign In Page
  - [x] 22.1 Create SignInPage component with authentication form
    - Create src/pages/SignInPage.tsx
    - Implement form with React Hook Form and Zod validation
    - Add fields: email, password
    - Add password visibility toggle with Eye icon
    - Add "Forgot Password?" link → /auth/forgot-password
    - Add "Don't have an account? Sign up" link → /auth/signup
    - Add submit button with loading state
    - Implement form submission handler with toast notifications
    - Style with shadcn/ui Card, Input, Button components
    - Make responsive with Tailwind CSS
    - _Requirements: 8.2.1, 8.2.2, 8.2.3, 8.2.4, 8.2.5, 8.2.6, 8.2.7, 8.2.8, 8.2.9, 8.2.10_

- [x] 23. Implement Sign Up Page
  - [x] 23.1 Create SignUpPage component with registration form
    - Create src/pages/SignUpPage.tsx
    - Implement form with React Hook Form and Zod validation
    - Add fields: fullName, email, companyName, password, confirmPassword
    - Add password visibility toggles for both password fields
    - Implement password strength validation (uppercase, lowercase, number)
    - Add Terms & Conditions checkbox with links to /terms and /privacy
    - Add "Already have an account? Sign in" link → /auth/signin
    - Add submit button with loading state
    - Implement form submission handler with toast notifications
    - Style with shadcn/ui Card, Input, Button, Checkbox components
    - Make responsive with Tailwind CSS
    - _Requirements: 8.3.1, 8.3.2, 8.3.3, 8.3.4, 8.3.5, 8.3.6, 8.3.7, 8.3.8_

- [x] 24. Implement Forgot Password Page
  - [x] 24.1 Create ForgotPasswordPage component with password reset form
    - Create src/pages/ForgotPasswordPage.tsx
    - Implement two-state UI: Initial form and Success confirmation
    - Add email input field with validation
    - Add "Send Reset Link" button with loading state
    - Implement success state with helpful instructions
    - Add "Try Another Email" and "Back to Sign In" buttons
    - Add "Contact Support" link → /contact
    - Style with shadcn/ui Card, Input, Button components
    - Make responsive with Tailwind CSS
    - _Requirements: 8.4.1, 8.4.2, 8.4.3, 8.4.4, 8.4.5, 8.4.6, 8.4.7_

- [x] 25. Implement Contact Page
  - [x] 25.1 Create ContactPage component with contact info and form
    - Create src/pages/ContactPage.tsx
    - Implement two-column layout (desktop) / single-column (mobile)
    - Add contact information card with email, phone, address
    - Add icons: Mail, Phone, MapPin from lucide-react
    - Implement contact form with React Hook Form and Zod validation
    - Add fields: fullName, email, subject, message
    - Add submit button with loading state
    - Implement form submission handler with toast notifications
    - Style with shadcn/ui Card, Input, Textarea, Button components
    - Make responsive with Tailwind CSS grid layout
    - _Requirements: 8.5.1, 8.5.2, 8.5.3, 8.5.4, 8.5.5, 8.5.6, 8.5.7, 8.5.8_

- [x] 26. Implement Privacy Policy Page
  - [x] 26.1 Create PrivacyPolicyPage component with content and navigation
    - Create src/pages/PrivacyPolicyPage.tsx
    - Define privacyPolicySections data array with all sections
    - Implement hero section with title and last updated date
    - Implement table of contents with anchor links
    - Make TOC sticky on desktop, collapsible on mobile
    - Implement content sections with proper heading hierarchy (h1, h2, h3)
    - Add smooth scroll behavior for TOC links
    - Style with shadcn/ui Card, ScrollArea components
    - Make responsive with two-column (desktop) / single-column (mobile) layout
    - _Requirements: 8.6.1, 8.6.2, 8.6.3, 8.6.4, 8.6.5, 8.6.6, 8.6.7_

- [x] 27. Implement Terms of Service Page
  - [x] 27.1 Create TermsOfServicePage component with content and navigation
    - Create src/pages/TermsOfServicePage.tsx
    - Define termsOfServiceSections data array with all sections
    - Implement hero section with title and last updated date
    - Implement table of contents with anchor links
    - Make TOC sticky on desktop, collapsible on mobile
    - Implement content sections with proper heading hierarchy
    - Add smooth scroll behavior for TOC links
    - Style with shadcn/ui Card, ScrollArea components
    - Make responsive with two-column (desktop) / single-column (mobile) layout
    - _Requirements: 8.7.1, 8.7.2, 8.7.3, 8.7.4, 8.7.5, 8.7.6, 8.7.7_

- [x] 28. Implement Request a Quote Page
  - [x] 28.1 Create RequestQuotePage component with form
    - Create src/pages/RequestQuotePage.tsx
    - Implement form with React Hook Form and Zod validation
    - Add fields: fullName, email, companyName, phoneNumber, industry, estimatedDataVolume, requirements
    - Add Select dropdown for industry with predefined options (Financial Services, Agriculture, Energy, Mining, Construction, Government, Environment, Insurance, Other)
    - Add Select dropdown for data volume with predefined ranges (< 1 TB/month, 1-10 TB/month, 10-50 TB/month, 50-100 TB/month, > 100 TB/month, Not sure)
    - Add submit button with loading state
    - Implement form submission handler with toast notifications
    - Style with shadcn/ui Card, Input, Select, Textarea, Button components
    - Make responsive with grid layout (2 columns on desktop, 1 on mobile)
    - _Requirements: 8.8.1, 8.8.2, 8.8.3, 8.8.4, 8.8.5, 8.8.6, 8.8.7, 8.8.8, 8.8.9_

- [x] 29. Implement Get Started Page
  - [x] 29.1 Create GetStartedPage component with onboarding flow
    - Create src/pages/GetStartedPage.tsx
    - Implement hero section with title and description
    - Create three-step flow cards: Explore Products, Book a Demo, Sign Up
    - Add clear CTAs for each step linking to appropriate pages
    - Implement benefits section with checkmarks
    - Add pricing preview section with links to /pricing and /quote
    - Add final CTA section with demo and contact buttons
    - Style with shadcn/ui Card, Button components
    - Make responsive with grid layout
    - _Requirements: 8.9.1, 8.9.2, 8.9.3, 8.9.4, 8.9.5, 8.9.6_

- [x] 30. Update routing configuration
  - [x] 30.1 Add new routes to App.tsx
    - Import all new page components
    - Add route for /demo → BookDemoPage
    - Add route for /get-started → GetStartedPage
    - Add route for /auth/signin → SignInPage
    - Add route for /auth/signup → SignUpPage
    - Add route for /auth/forgot-password → ForgotPasswordPage
    - Add route for /contact → ContactPage
    - Add route for /privacy → PrivacyPolicyPage
    - Add route for /terms → TermsOfServicePage
    - Add route for /quote → RequestQuotePage
    - Ensure all routes are added before the catch-all "*" route
    - _Requirements: 8.11.1, 8.11.2, 8.11.3, 8.11.4_

- [x] 31. Update navigation links across the application
  - [x] 31.1 Update Hero component "Get Started" button
    - Change link from /products to /get-started
    - Ensure "Book a Demo" button links to /demo
    - _Requirements: 8.11.2_
  
  - [x] 31.2 Update IndustryDetailPage navigation buttons
    - Fix "Book a Demo" button to link to /demo (was /#demo)
    - Fix "Contact Us" button to link to /contact (was /#contact)
    - _Requirements: 8.11.2_
  
  - [x] 31.3 Update ProductDetailPage navigation buttons
    - Add "Book a Demo" buttons linking to /demo
    - Add "Contact Sales" buttons linking to /contact
    - Add "Request a Quote" button linking to /quote
    - _Requirements: 8.11.2_
  
  - [x] 31.4 Update AboutPage navigation buttons
    - Add "Book a Demo" button linking to /demo
    - Add "Contact Us" button linking to /contact
    - _Requirements: 8.11.2_
  
  - [x] 31.5 Update SpecsPage navigation buttons
    - Add "Contact Our Experts" button linking to /contact
    - _Requirements: 8.11.2_
  
  - [x] 31.6 Update PricingPage navigation links
    - Fix "Contact Sales" link to use Link component → /contact
    - Fix "View Products" link to use Link component → /products
    - _Requirements: 8.11.2_
  
  - [x] 31.7 Update PlanComparison component buttons
    - Add "Get Started" buttons linking to /demo
    - Add "Contact Sales" button linking to /contact
    - _Requirements: 8.11.2_
  
  - [x] 31.8 Update ProductCard component links
    - Fix product detail links to use Link component
    - _Requirements: 8.11.2_
  
  - [x] 31.9 Update NotFound page link
    - Fix "Return to Home" link to use Link component → /
    - _Requirements: 8.11.2_

- [x] 32. Final verification and testing
  - [x] 32.1 Verify all pages render correctly
    - Test all routes navigate properly
    - Verify all forms display correctly
    - Check responsive layouts on mobile, tablet, desktop
    - _Requirements: 8.12.1, 8.12.2, 8.12.3_
  
  - [x] 32.2 Verify form validation works
    - Test email validation across all forms
    - Test required field validation
    - Test password strength validation on Sign Up
    - Test password match validation on Sign Up
    - _Requirements: 8.10.1, 8.10.2, 8.10.3_
  
  - [x] 32.3 Verify navigation flow
    - Test all internal links work correctly
    - Test back buttons and navigation breadcrumbs
    - Verify no broken links
    - _Requirements: 8.11.2, 8.11.3_
  
  - [x] 32.4 Run build and check for errors
    - Execute npm run build
    - Verify no TypeScript errors
    - Verify no linting errors
    - Check bundle size
    - _Requirements: 4.1_
  
  - [x] 32.5 Verify accessibility
    - Check ARIA labels on all form inputs
    - Verify keyboard navigation works
    - Test with screen reader (if available)
    - Verify heading hierarchy
    - _Requirements: 8.13.1, 8.13.2, 8.13.3, 8.13.4, 8.13.5_

## Notes

- Tasks marked with `*` are optional property-based tests
- All forms are placeholder implementations for Phase 3 backend integration
- Form submissions currently show success messages without actual backend calls
- All pages use shadcn/ui components for design consistency
- All pages are responsive using Tailwind CSS breakpoints
- All navigation uses React Router Link component for client-side routing
- Password reset functionality requires backend email service (Phase 3)
- User authentication requires backend JWT implementation (Phase 3)


### Phase 3: Backend Integration for Missing Pages

- [ ] 28. Backend setup for missing pages authentication
  - [ ] 28.1 Update User model for missing pages features
    - Add fields to models/User.js: fullName, companyName, phoneNumber, jobTitle
    - Add passwordResetToken and passwordResetExpires fields
    - Add emailVerified and emailVerificationToken fields
    - Add timestamps (createdAt, updatedAt)
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ] 28.2 Create password reset token generation utility
    - Create utils/tokenGenerator.js
    - Implement generateResetToken() function
    - Implement generateVerificationToken() function
    - Use crypto.randomBytes for secure tokens
    - _Requirements: 8.4_
  
  - [ ] 28.3 Create email templates for authentication
    - Create templates/passwordReset.html
    - Create templates/emailVerification.html
    - Create templates/welcomeEmail.html
    - Include branded styling and clear CTAs
    - _Requirements: 8.3, 8.4_

- [ ] 29. Sign Up API implementation
  - [ ] 29.1 Create sign up endpoint
    - Implement POST /api/auth/signup in routes/auth.js
    - Validate input: fullName, email, companyName, password
    - Check if email already exists in MongoDB
    - Hash password with bcrypt (salt rounds: 10)
    - Create user document in MongoDB
    - Generate email verification token
    - Send welcome email with verification link
    - Return JWT token and user data (exclude password)
    - _Requirements: 8.3.1, 8.3.2, 8.3.3_
  
  - [ ] 29.2 Implement email verification endpoint
    - Implement GET /api/auth/verify-email/:token
    - Find user by emailVerificationToken
    - Check token expiration
    - Update emailVerified to true
    - Clear verification token
    - Return success message
    - _Requirements: 8.3_
  
  - [ ] 29.3 Update SignUpPage to connect to backend
    - Replace handleFormSubmission with API call to POST /api/auth/signup
    - Store JWT token in localStorage
    - Update AuthContext with user data
    - Redirect to dashboard or show email verification message
    - Handle API errors (email exists, validation errors)
    - _Requirements: 8.3.1, 8.3.2, 8.3.3_
  
  - [ ]* 29.4 Write property test for sign up validation
    - **Property 21: Sign Up Validation**
    - **Validates: Requirements 8.3.3, 8.3.4, 8.3.5**

- [ ] 30. Sign In API implementation
  - [ ] 30.1 Update sign in endpoint for missing pages
    - Update POST /api/auth/signin in routes/auth.js
    - Validate input: email, password
    - Find user by email in MongoDB
    - Compare password with bcrypt
    - Check if email is verified
    - Generate JWT token with user id and role
    - Return JWT token and user data (exclude password)
    - _Requirements: 8.2.1, 8.2.2, 8.2.3_
  
  - [ ] 30.2 Update SignInPage to connect to backend
    - Replace handleFormSubmission with API call to POST /api/auth/signin
    - Store JWT token in localStorage
    - Update AuthContext with user data
    - Redirect to dashboard or previous page
    - Handle API errors (invalid credentials, unverified email)
    - _Requirements: 8.2.1, 8.2.2, 8.2.3_
  
  - [ ]* 30.3 Write property test for sign in authentication
    - **Property 22: Sign In Authentication**
    - **Validates: Requirements 8.2.3, 8.2.4, 8.2.5**

- [ ] 31. Forgot Password API implementation
  - [ ] 31.1 Create forgot password endpoint
    - Implement POST /api/auth/forgot-password in routes/auth.js
    - Validate input: email
    - Find user by email in MongoDB
    - Generate password reset token (expires in 1 hour)
    - Save token and expiration to user document
    - Send password reset email with reset link
    - Return success message (don't reveal if email exists)
    - _Requirements: 8.4.1, 8.4.2, 8.4.3, 8.4.4_
  
  - [ ] 31.2 Create reset password endpoint
    - Implement POST /api/auth/reset-password in routes/auth.js
    - Validate input: token, newPassword
    - Find user by passwordResetToken
    - Check token expiration
    - Hash new password with bcrypt
    - Update user password in MongoDB
    - Clear reset token and expiration
    - Send password changed confirmation email
    - Return success message
    - _Requirements: 8.4_
  
  - [ ] 31.3 Create ResetPasswordPage component
    - Create src/pages/ResetPasswordPage.tsx
    - Extract token from URL query parameter
    - Form with newPassword and confirmPassword fields
    - Password strength validation
    - Submit to POST /api/auth/reset-password
    - Show success message and redirect to sign in
    - Handle expired/invalid token errors
    - _Requirements: 8.4_
  
  - [ ] 31.4 Update ForgotPasswordPage to connect to backend
    - Replace handleFormSubmission with API call to POST /api/auth/forgot-password
    - Handle API response
    - Show success state
    - _Requirements: 8.4.1, 8.4.2, 8.4.3_
  
  - [ ]* 31.5 Write property test for password reset flow
    - **Property 23: Password Reset Flow**
    - **Validates: Requirements 8.4.3, 8.4.4**

- [ ] 32. Book Demo API implementation
  - [ ] 32.1 Create demo booking model
    - Create models/DemoBooking.js
    - Fields: fullName, email, companyName, phoneNumber, jobTitle, message, status, createdAt
    - Add indexes on email and createdAt
    - Add status enum: pending, confirmed, completed, cancelled
    - _Requirements: 8.1_
  
  - [ ] 32.2 Create demo booking endpoint
    - Implement POST /api/demo/book in routes/demo.js
    - Validate input: fullName, email, companyName, phoneNumber, jobTitle, message
    - Create demo booking document in MongoDB
    - Send confirmation email to user
    - Send notification email to sales team
    - Return success message with booking ID
    - _Requirements: 8.1.1, 8.1.2, 8.1.3_
  
  - [ ] 32.3 Create demo booking management endpoints
    - Implement GET /api/admin/demo/bookings (admin only)
    - Implement PUT /api/admin/demo/bookings/:id/status (admin only)
    - Implement GET /api/demo/bookings/user/:userId (authenticated user)
    - Add requireAuth and requireAdmin middleware
    - _Requirements: 8.1_
  
  - [ ] 32.4 Update BookDemoPage to connect to backend
    - Replace handleFormSubmission with API call to POST /api/demo/book
    - Handle API response
    - Show success message with booking confirmation
    - Handle API errors (validation, server errors)
    - _Requirements: 8.1.1, 8.1.2, 8.1.3_
  
  - [ ]* 32.5 Write property test for demo booking persistence
    - **Property 24: Demo Booking Persistence**
    - **Validates: Requirements 8.1.3**

- [ ] 33. Contact Form API implementation
  - [ ] 33.1 Create contact inquiry model
    - Create models/ContactInquiry.js
    - Fields: fullName, email, subject, message, status, createdAt
    - Add indexes on email and createdAt
    - Add status enum: new, in-progress, resolved, closed
    - _Requirements: 8.5_
  
  - [ ] 33.2 Create contact form endpoint
    - Implement POST /api/contact in routes/contact.js
    - Validate input: fullName, email, subject, message
    - Create contact inquiry document in MongoDB
    - Send confirmation email to user
    - Send notification email to support team
    - Return success message with inquiry ID
    - _Requirements: 8.5.1, 8.5.2, 8.5.3, 8.5.4_
  
  - [ ] 33.3 Create contact inquiry management endpoints
    - Implement GET /api/admin/contact/inquiries (admin only)
    - Implement PUT /api/admin/contact/inquiries/:id/status (admin only)
    - Implement GET /api/contact/inquiries/user/:userId (authenticated user)
    - Add requireAuth and requireAdmin middleware
    - _Requirements: 8.5_
  
  - [ ] 33.4 Update ContactPage to connect to backend
    - Replace handleFormSubmission with API call to POST /api/contact
    - Handle API response
    - Show success message
    - Handle API errors (validation, server errors)
    - _Requirements: 8.5.1, 8.5.2, 8.5.3, 8.5.4_
  
  - [ ]* 33.5 Write property test for contact form validation
    - **Property 25: Contact Form Validation**
    - **Validates: Requirements 8.5.5, 8.5.6**

- [ ] 34. Request Quote API implementation
  - [ ] 34.1 Create quote request model
    - Create models/QuoteRequest.js
    - Fields: fullName, email, companyName, phoneNumber, industry, estimatedDataVolume, requirements, status, createdAt
    - Add indexes on email and createdAt
    - Add status enum: pending, quoted, accepted, declined
    - _Requirements: 8.8_
  
  - [ ] 34.2 Create quote request endpoint
    - Implement POST /api/quote/request in routes/quote.js
    - Validate input: fullName, email, companyName, phoneNumber, industry, estimatedDataVolume, requirements
    - Create quote request document in MongoDB
    - Send confirmation email to user
    - Send notification email to sales team
    - Return success message with quote request ID
    - _Requirements: 8.8.1, 8.8.2, 8.8.3, 8.8.5_
  
  - [ ] 34.3 Create quote request management endpoints
    - Implement GET /api/admin/quote/requests (admin only)
    - Implement PUT /api/admin/quote/requests/:id/status (admin only)
    - Implement PUT /api/admin/quote/requests/:id/quote (admin only - add quote details)
    - Implement GET /api/quote/requests/user/:userId (authenticated user)
    - Add requireAuth and requireAdmin middleware
    - _Requirements: 8.8_
  
  - [ ] 34.4 Update RequestQuotePage to connect to backend
    - Replace handleFormSubmission with API call to POST /api/quote/request
    - Handle API response
    - Show success message
    - Handle API errors (validation, server errors)
    - _Requirements: 8.8.1, 8.8.2, 8.8.3, 8.8.5_
  
  - [ ]* 34.5 Write property test for quote request validation
    - **Property 26: Quote Request Validation**
    - **Validates: Requirements 8.8.6, 8.8.7**

- [ ] 35. Content Management for Privacy Policy and Terms
  - [ ] 35.1 Create content model
    - Create models/Content.js
    - Fields: type (privacy-policy, terms-of-service), sections (array), lastUpdated, version
    - Add unique index on type
    - _Requirements: 8.6, 8.7_
  
  - [ ] 35.2 Create content endpoints
    - Implement GET /api/content/privacy in routes/content.js
    - Implement GET /api/content/terms in routes/content.js
    - Implement PUT /api/admin/content/:type (admin only)
    - Return content sections and lastUpdated date
    - _Requirements: 8.6.1, 8.6.2, 8.7.1, 8.7.2_
  
  - [ ] 35.3 Seed initial content
    - Create seeds/content.js
    - Add initial privacy policy content
    - Add initial terms of service content
    - Run seed script to populate MongoDB
    - _Requirements: 8.6, 8.7_
  
  - [ ] 35.4 Update PrivacyPolicyPage to fetch from backend
    - Replace static content with API call to GET /api/content/privacy
    - Implement loading state
    - Handle API errors
    - _Requirements: 8.6.1, 8.6.2, 8.6.3_
  
  - [ ] 35.5 Update TermsOfServicePage to fetch from backend
    - Replace static content with API call to GET /api/content/terms
    - Implement loading state
    - Handle API errors
    - _Requirements: 8.7.1, 8.7.2, 8.7.3_
  
  - [ ] 35.6 Create ContentEditor component (admin only)
    - Create admin page for editing privacy policy and terms
    - Rich text editor for content sections
    - Save to PUT /api/admin/content/:type
    - Version control and change history
    - _Requirements: 8.6, 8.7_

- [ ] 36. Admin Dashboard for Missing Pages
  - [ ] 36.1 Create admin dashboard page
    - Create src/pages/admin/DashboardPage.tsx
    - Display statistics: total users, demo bookings, contact inquiries, quote requests
    - Recent activity feed
    - Quick actions for common tasks
    - Protected route (admin only)
    - _Requirements: 8.1, 8.5, 8.8_
  
  - [ ] 36.2 Create demo bookings management page
    - Create src/pages/admin/DemoBookingsPage.tsx
    - List all demo bookings from MongoDB
    - Filter by status (pending, confirmed, completed, cancelled)
    - Update booking status
    - View booking details
    - Export to CSV
    - _Requirements: 8.1_
  
  - [ ] 36.3 Create contact inquiries management page
    - Create src/pages/admin/ContactInquiriesPage.tsx
    - List all contact inquiries from MongoDB
    - Filter by status (new, in-progress, resolved, closed)
    - Update inquiry status
    - View inquiry details
    - Reply to inquiries (send email)
    - _Requirements: 8.5_
  
  - [ ] 36.4 Create quote requests management page
    - Create src/pages/admin/QuoteRequestsPage.tsx
    - List all quote requests from MongoDB
    - Filter by status (pending, quoted, accepted, declined)
    - Update request status
    - Add quote details (pricing, terms)
    - Send quote email to customer
    - _Requirements: 8.8_
  
  - [ ] 36.5 Create user management page
    - Create src/pages/admin/UsersPage.tsx
    - List all users from MongoDB
    - View user details and activity
    - Update user roles (user, admin)
    - Deactivate/activate user accounts
    - _Requirements: 8.2, 8.3_

- [ ] 37. Email notification system for missing pages
  - [ ] 37.1 Create email service for authentication
    - Implement sendWelcomeEmail() in services/email.js
    - Implement sendEmailVerification() in services/email.js
    - Implement sendPasswordResetEmail() in services/email.js
    - Implement sendPasswordChangedEmail() in services/email.js
    - Use email templates from templates/
    - _Requirements: 8.3, 8.4_
  
  - [ ] 37.2 Create email service for forms
    - Implement sendDemoBookingConfirmation() in services/email.js
    - Implement sendDemoBookingNotification() (to sales team)
    - Implement sendContactInquiryConfirmation() in services/email.js
    - Implement sendContactInquiryNotification() (to support team)
    - Implement sendQuoteRequestConfirmation() in services/email.js
    - Implement sendQuoteRequestNotification() (to sales team)
    - Implement sendQuoteEmail() (send quote to customer)
    - _Requirements: 8.1, 8.5, 8.8_
  
  - [ ] 37.3 Configure email service provider
    - Set up SendGrid or Nodemailer with SMTP
    - Add API keys to environment variables
    - Configure sender email and name
    - Test email delivery
    - _Requirements: 4.2_
  
  - [ ] 37.4 Implement email queue (optional)
    - Install Bull or BullMQ for job queue
    - Create email queue worker
    - Add retry logic for failed emails
    - Monitor queue health
    - _Requirements: 4.2_

- [ ] 38. API client and error handling
  - [ ] 38.1 Create API client for missing pages
    - Create src/lib/api/auth.ts with auth endpoints
    - Create src/lib/api/demo.ts with demo booking endpoints
    - Create src/lib/api/contact.ts with contact endpoints
    - Create src/lib/api/quote.ts with quote endpoints
    - Create src/lib/api/content.ts with content endpoints
    - Add JWT token to request headers
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ] 38.2 Implement error handling
    - Create src/lib/api/errorHandler.ts
    - Handle network errors
    - Handle validation errors (400)
    - Handle authentication errors (401)
    - Handle authorization errors (403)
    - Handle not found errors (404)
    - Handle server errors (500)
    - Display user-friendly error messages
    - _Requirements: 8.10.3_
  
  - [ ] 38.3 Implement loading states
    - Create useAsync hook for API calls
    - Show loading spinners during API calls
    - Disable form buttons during submission
    - _Requirements: 8.10.4_
  
  - [ ] 38.4 Implement success notifications
    - Use toast notifications for success messages
    - Clear forms after successful submission
    - Redirect to appropriate pages
    - _Requirements: 8.10.5_

- [ ] 39. Security and validation
  - [ ] 39.1 Implement rate limiting
    - Install express-rate-limit
    - Add rate limiting to auth endpoints (5 requests per 15 minutes)
    - Add rate limiting to form endpoints (10 requests per hour)
    - Return 429 Too Many Requests when limit exceeded
    - _Requirements: 4.2_
  
  - [ ] 39.2 Implement input sanitization
    - Install express-validator or joi
    - Sanitize all user inputs
    - Prevent XSS attacks
    - Prevent SQL injection (MongoDB)
    - _Requirements: 4.2_
  
  - [ ] 39.3 Implement CORS configuration
    - Configure CORS for frontend origin only
    - Set allowed methods (GET, POST, PUT, DELETE)
    - Set allowed headers
    - Enable credentials
    - _Requirements: 4.2_
  
  - [ ] 39.4 Implement security headers
    - Install helmet
    - Add security headers (CSP, HSTS, etc.)
    - Configure helmet middleware
    - _Requirements: 4.2_
  
  - [ ] 39.5 Implement password security
    - Enforce password strength requirements
    - Hash passwords with bcrypt (salt rounds: 10)
    - Never log or expose passwords
    - Implement password history (prevent reuse)
    - _Requirements: 8.3.5_

- [ ] 40. Testing for missing pages backend
  - [ ]* 40.1 Write integration tests for authentication
    - Test sign up flow (POST /api/auth/signup)
    - Test sign in flow (POST /api/auth/signin)
    - Test forgot password flow (POST /api/auth/forgot-password)
    - Test reset password flow (POST /api/auth/reset-password)
    - Test email verification flow (GET /api/auth/verify-email/:token)
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ]* 40.2 Write integration tests for forms
    - Test demo booking (POST /api/demo/book)
    - Test contact form (POST /api/contact)
    - Test quote request (POST /api/quote/request)
    - Verify data persistence in MongoDB
    - Verify email notifications sent
    - _Requirements: 8.1, 8.5, 8.8_
  
  - [ ]* 40.3 Write integration tests for admin endpoints
    - Test admin authentication and authorization
    - Test demo bookings management
    - Test contact inquiries management
    - Test quote requests management
    - Test user management
    - _Requirements: 8.1, 8.5, 8.8_
  
  - [ ]* 40.4 Write property tests for backend validation
    - **Property 27: Backend Email Validation**
    - **Property 28: Backend Required Field Validation**
    - **Property 29: Backend Password Strength Validation**
    - **Validates: Requirements 8.10.1, 8.10.2, 8.3.5**

- [ ] 41. Documentation for missing pages backend
  - [ ] 41.1 Create API documentation
    - Document all authentication endpoints
    - Document all form submission endpoints
    - Document all admin endpoints
    - Include request/response examples
    - Document error codes and messages
    - Use Swagger/OpenAPI or Postman collection
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.8_
  
  - [ ] 41.2 Create deployment guide
    - Document environment variables
    - Document MongoDB setup
    - Document email service configuration
    - Document deployment steps
    - Include troubleshooting guide
    - _Requirements: 4.3_
  
  - [ ] 41.3 Create admin user guide
    - Document admin dashboard features
    - Document how to manage demo bookings
    - Document how to manage contact inquiries
    - Document how to manage quote requests
    - Document how to manage users
    - _Requirements: 8.1, 8.5, 8.8_

- [ ] 42. Final checkpoint for missing pages backend
  - Verify all authentication flows work end-to-end
  - Verify all forms submit to backend successfully
  - Verify all emails are sent correctly
  - Verify admin dashboard displays data from MongoDB
  - Test security measures (rate limiting, input sanitization)
  - Run all integration tests
  - Review API documentation
  - Ask the user if questions arise
