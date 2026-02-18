

# Earth Intelligence Platform — Full Website

## Phase 1: Foundation & Homepage
Build the core layout and stunning homepage with smooth animations.

### Navigation Bar
- Sticky top navbar with logo, menu links (Products, Industries, Specs, Pricing, Partners), and CTA buttons ("Book a Demo", "Order Now")
- Dropdown menu for Industries with sub-items
- Mobile hamburger menu with slide-in drawer
- Smooth scroll-based transparency effect

### Hero Section
- Full-screen dark background with satellite imagery/animation
- Coordinates overlay text with typing animation
- Large heading "Earth Intelligence Platform" with fade-in
- CTA button with hover effects
- Animated satellite detection boxes floating over the imagery

### Trusted By Section
- Auto-scrolling infinite logo carousel of partner/client logos
- Smooth marquee animation

### Products Section
- Horizontal scrollable product cards carousel
- Each card with image, pricing badge, title, description, and CTA links
- Smooth slide transitions between cards

### Industries Section
- Tab-based navigation (Financial Services, Agriculture, Energy, etc.)
- Each tab reveals industry-specific imagery and description with fade transitions
- Swipe support on mobile

### Pricing Highlights Section
- Feature grid with icons (Comprehensive Coverage, High Precision, Cost-Effective, etc.)
- CTA buttons to pricing page

### Partners Grid
- Logo grid of satellite/data partners
- Hover effects on each logo

### About Our Preview
- Three stacked info cards with images and descriptions
- Scroll-triggered fade-in animations

### Blog/News Section
- Latest 3 article cards with images, titles, and dates
- Link to full blog page

### Footer
- Multi-column footer with links, social media icons, newsletter signup, and legal links
- Cookie consent banner

---

## Phase 2: Additional Pages

### Products Page
- Full listing of all products (Analytics, Commercial Imagery, Open Data, Vantor, Maxar Connect, AIS Data, ATAK Plugin, ICEYE US, Planet Select)
- Individual product detail pages with hero, features, use cases, and CTAs

### Industries Pages
- Overview page with all industries
- Individual industry pages (Financial Services, Agriculture, Energy, Mining, Construction, Government, Environment, Insurance)

### Pricing Page
- Interactive pricing table/calculator
- Comparison of plans and data types
- FAQ accordion

### Partners Page
- Partner directory with logos, descriptions, and links

### About Page
- Company story, mission, team section
- Timeline or milestones

### Blog Page
- Article listing with search/filter
- Individual blog post pages with rich content

### Specs Page
- Technical specifications for satellite data types
- Comparison tables for resolution, revisit time, coverage

---

## Phase 3: Backend & Full Functionality (Lovable Cloud + Supabase)

### User Authentication
- Sign up / Sign in with email and Google OAuth
- User profiles with preferences and order history
- Role-based access (admin, user)

### Demo Booking System
- "Book a Demo" form with date/time picker
- Stores submissions in database
- Email notification via edge function

### Contact Forms
- General contact form
- Partnership inquiry form

### Blog CMS (Admin)
- Admin dashboard for creating/editing blog posts
- Rich text editor, image uploads via Supabase Storage
- Published/draft status

### Order/Inquiry System
- Product inquiry forms linked to specific products
- Order tracking dashboard for users

### Newsletter Subscription
- Email collection with validation
- Stored in database

---

## Design & UX Principles Throughout
- **Dark theme** with deep navy/black backgrounds, white text, and gold/yellow accent colors
- **Smooth transitions**: fade-in on scroll, slide animations for carousels, hover scale effects on cards and buttons
- **Responsive design**: fully mobile-optimized with touch gestures
- **Professional typography**: clean, modern, spaced-out letterforms
- **Separate reusable components** for Navbar, Footer, Hero, ProductCard, IndustryTab, PricingCard, BlogCard, LogoCarousel, etc.

---

## Implementation Approach
We'll build this iteratively — starting with Phase 1 (homepage), then adding pages in Phase 2, and finally wiring up the backend in Phase 3. Each phase will be broken into smaller prompts to ensure quality and smooth execution.

