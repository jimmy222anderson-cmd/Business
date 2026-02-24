# Design Document: Earth Observation Platform Website

## 1. Overview

The Earth Observation Platform is a modern, dark-themed marketing website built with React/TypeScript that showcases satellite data products, industries served, pricing, and partners. The platform will be developed in three phases:

- **Phase 1**: Foundation & Homepage with core navigation, hero section, product carousel, industries tabs, and static content
- **Phase 2**: Additional pages (Products, Industries, Pricing, Partners, About, Blog, Specs)
- **Phase 3**: Backend integration for authentication, CMS, demo booking, and user management

The design emphasizes smooth animations, responsive layouts, and a professional dark aesthetic with gold/yellow accents. The architecture follows React best practices with component composition, TypeScript for type safety, and Tailwind CSS for styling.

## 2. Architecture

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App] --> B[React Router]
        A --> C[Component Library]
        A --> D[Animation Engine]
        B --> E[Page Components]
        C --> F[shadcn/ui Components]
        C --> G[Custom Components]
        D --> H[Framer Motion]
    end
    
    subgraph "State Management"
        I[React Context]
        J[Local Component State]
        K[URL State]
    end
    
    subgraph "Backend Layer (Phase 3)"
        L[Backend API]
        L --> M[Authentication Service]
        L --> N[Database]
        L --> O[Object Storage]
        L --> P[Email Service]
    end
    
    E --> I
    E --> J
    B --> K
    A --> L
    
    subgraph "External Services"
        Q[Email Provider]
        R[OAuth Provider]
    end
    
    P --> Q
    M --> R
```

### 2.2 Technology Stack

**Frontend Core:**
- React 18+ with TypeScript for type-safe component development
- Vite for fast development and optimized production builds
- React Router v6 for client-side routing

**Styling & UI:**
- Tailwind CSS for utility-first styling
- shadcn/ui for accessible, customizable components
- Framer Motion for declarative animations

**Backend (Phase 3):**
- Node.js with Express.js for REST API
- MongoDB with Mongoose ODM for data persistence
- MongoDB GridFS or cloud storage (AWS S3/Cloudinary) for media uploads
- Email service for notifications (SendGrid, Resend, or Nodemailer)
- JWT-based authentication with bcrypt for password hashing
- Optional: Passport.js for OAuth integration

**Development Tools:**
- TypeScript for static type checking
- ESLint for code quality
- Prettier for code formatting

### 2.3 Architectural Principles

1. **Component Composition**: Build complex UIs from small, reusable components
2. **Type Safety**: Leverage TypeScript for compile-time error detection
3. **Progressive Enhancement**: Core content accessible without JavaScript, enhanced with animations
4. **Separation of Concerns**: Clear boundaries between presentation, logic, and data layers
5. **Mobile-First**: Design and build for mobile, then enhance for larger screens
6. **Performance**: Lazy loading, code splitting, and optimized assets
7. **Accessibility**: WCAG AA compliance with semantic HTML and ARIA labels


## 3. Components and Interfaces

### 3.1 Component Hierarchy

```
App
├── Router
│   ├── Layout
│   │   ├── Navigation
│   │   │   ├── Logo
│   │   │   ├── NavLinks
│   │   │   ├── IndustriesDropdown
│   │   │   ├── CTAButtons
│   │   │   └── MobileMenu
│   │   ├── PageContent (Outlet)
│   │   └── Footer
│   │       ├── FooterLinks
│   │       ├── SocialIcons
│   │       ├── NewsletterForm
│   │       └── CookieConsent
│   │
│   ├── HomePage
│   │   ├── HeroSection
│   │   │   ├── CoordinatesOverlay
│   │   │   ├── SatelliteDetectionBoxes
│   │   │   └── HeroCTA
│   │   ├── TrustedBySection
│   │   │   └── LogoMarquee
│   │   ├── ProductsSection
│   │   │   └── ProductCarousel
│   │   │       └── ProductCard[]
│   │   ├── IndustriesSection
│   │   │   ├── IndustryTabs
│   │   │   └── IndustryContent
│   │   ├── PricingHighlights
│   │   │   └── FeatureGrid
│   │   ├── PartnersGrid
│   │   ├── AboutPreview
│   │   │   └── InfoCard[]
│   │   └── BlogSection
│   │       └── ArticleCard[]
│   │
│   ├── ProductsPage
│   │   └── ProductGrid
│   │       └── ProductCard[]
│   │
│   ├── ProductDetailPage
│   │   ├── ProductHero
│   │   ├── ProductFeatures
│   │   ├── ProductUseCases
│   │   └── ProductCTA
│   │
│   ├── IndustriesPage
│   │   └── IndustryGrid
│   │
│   ├── IndustryDetailPage
│   │   ├── IndustryHero
│   │   ├── UseCases
│   │   └── IndustryCTA
│   │
│   ├── PricingPage
│   │   ├── PricingCalculator
│   │   ├── PlanComparison
│   │   └── PricingFAQ
│   │
│   ├── PartnersPage
│   │   └── PartnerDirectory
│   │
│   ├── AboutPage
│   │   ├── CompanyStory
│   │   ├── TeamSection
│   │   └── Timeline
│   │
│   ├── BlogPage
│   │   ├── BlogSearch
│   │   └── BlogGrid
│   │       └── ArticleCard[]
│   │
│   ├── BlogPostPage
│   │   ├── PostHero
│   │   ├── PostContent
│   │   └── PostMetadata
│   │
│   ├── SpecsPage
│   │   └── SpecsTable
│   │
│   ├── AuthPage (Phase 3)
│   │   ├── SignUpForm
│   │   ├── SignInForm
│   │   └── OAuthButtons
│   │
│   ├── DashboardPage (Phase 3)
│   │   ├── UserProfile
│   │   ├── OrderHistory
│   │   └── DemoBookings
│   │
│   └── AdminCMSPage (Phase 3)
│       ├── PostEditor
│       ├── MediaManager
│       └── InquiryManager
```


### 3.2 Core Component Interfaces

#### Navigation Component

```typescript
interface NavigationProps {
  transparent?: boolean;
}

interface NavLink {
  label: string;
  href: string;
  dropdown?: NavLink[];
}

interface IndustryDropdownProps {
  industries: NavLink[];
  isOpen: boolean;
  onToggle: () => void;
}
```

#### Hero Section

```typescript
interface HeroSectionProps {
  backgroundImage: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
}

interface CoordinatesOverlayProps {
  coordinates: string[];
  typingSpeed?: number;
}

interface DetectionBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}
```

#### Product Components

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price?: string;
  pricingBadge?: string;
  features: string[];
  useCases: string[];
  detailLink: string;
}

interface ProductCardProps {
  product: Product;
  variant?: 'carousel' | 'grid';
}

interface ProductCarouselProps {
  products: Product[];
  autoPlay?: boolean;
  interval?: number;
}
```

#### Industry Components

```typescript
interface Industry {
  id: string;
  name: string;
  description: string;
  image: string;
  useCases: string[];
  detailLink: string;
}

interface IndustryTabsProps {
  industries: Industry[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

interface IndustryContentProps {
  industry: Industry;
}
```


#### Animation Components

```typescript
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  triggerOnScroll?: boolean;
}

interface SlideInProps {
  children: React.ReactNode;
  direction: 'left' | 'right' | 'up' | 'down';
  delay?: number;
}

interface MarqueeProps {
  items: React.ReactNode[];
  speed?: number;
  pauseOnHover?: boolean;
}
```

#### Form Components

```typescript
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'date';
  required?: boolean;
  placeholder?: string;
  validation?: (value: string) => string | null;
}

interface ContactFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitText?: string;
}

interface NewsletterFormProps {
  onSubscribe: (email: string) => Promise<void>;
}
```

### 3.3 Routing Structure

```typescript
// Route configuration
const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/products', element: <ProductsPage /> },
  { path: '/products/:productId', element: <ProductDetailPage /> },
  { path: '/industries', element: <IndustriesPage /> },
  { path: '/industries/:industryId', element: <IndustryDetailPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/partners', element: <PartnersPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/blog', element: <BlogPage /> },
  { path: '/blog/:postId', element: <BlogPostPage /> },
  { path: '/specs', element: <SpecsPage /> },
  
  // Phase 3 routes
  { path: '/auth/signup', element: <SignUpPage /> },
  { path: '/auth/signin', element: <SignInPage /> },
  { path: '/dashboard', element: <DashboardPage />, protected: true },
  { path: '/admin/cms', element: <AdminCMSPage />, protected: true, adminOnly: true },
];
```


## 4. Data Models

### 4.1 Frontend Data Models (Phases 1-2)

These models represent the shape of data used in the frontend, initially from static JSON files or constants.

```typescript
// Product model
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  price?: string;
  pricingBadge?: string;
  features: Feature[];
  useCases: UseCase[];
  specifications: Specification[];
  category: 'analytics' | 'imagery' | 'data' | 'plugin';
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface UseCase {
  id: string;
  title: string;
  description: string;
  industry?: string;
}

interface Specification {
  key: string;
  value: string;
  unit?: string;
}

// Industry model
interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  useCases: UseCase[];
  relevantProducts: string[]; // Product IDs
}

// Blog post model
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage: string;
  tags: string[];
  status: 'draft' | 'published';
}

// Partner model
interface Partner {
  id: string;
  name: string;
  logo: string;
  description?: string;
  website?: string;
  category: 'satellite' | 'data' | 'technology' | 'client';
}

// Pricing plan model
interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'one-time';
  features: string[];
  highlighted?: boolean;
}
```


### 4.2 Backend Data Models (Phase 3)

These models represent MongoDB document schemas using Mongoose.

```typescript
// User model
interface UserProfile {
  _id: string; // MongoDB ObjectId
  email: string;
  password_hash: string; // bcrypt hashed password
  full_name?: string;
  company?: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

// Demo booking model
interface DemoBooking {
  _id: string; // MongoDB ObjectId
  user_id?: string; // references UserProfile._id
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  preferred_date: Date;
  preferred_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

// Contact inquiry model
interface ContactInquiry {
  _id: string; // MongoDB ObjectId
  user_id?: string; // optional, references UserProfile._id
  inquiry_type: 'general' | 'partnership' | 'product' | 'support';
  full_name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: Date;
  updated_at: Date;
}

// Product inquiry/order model
interface ProductInquiry {
  _id: string; // MongoDB ObjectId
  user_id?: string; // optional, references UserProfile._id
  product_id: string;
  full_name: string;
  email: string;
  company?: string;
  message: string;
  status: 'pending' | 'quoted' | 'ordered' | 'completed';
  created_at: Date;
  updated_at: Date;
}

// Newsletter subscription model
interface NewsletterSubscription {
  _id: string; // MongoDB ObjectId
  email: string; // unique index
  subscribed_at: Date;
  unsubscribed_at?: Date;
  status: 'active' | 'unsubscribed';
}

// Blog post model (CMS)
interface BlogPostDB {
  _id: string; // MongoDB ObjectId
  slug: string; // unique index
  title: string;
  excerpt: string;
  content: string; // Rich text/markdown
  author_id: string; // references UserProfile._id
  featured_image_url?: string;
  tags: string[];
  status: 'draft' | 'published';
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```


### 4.3 MongoDB Schema Definitions (Phase 3)

Mongoose schema definitions for MongoDB collections:

```javascript
// models/UserProfile.js
const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  full_name: String,
  company: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for faster queries
userProfileSchema.index({ email: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);

// models/DemoBooking.js
const demoBookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  },
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  company: String,
  phone: String,
  preferred_date: {
    type: Date,
    required: true
  },
  preferred_time: {
    type: String,
    required: true
  },
  message: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for performance
demoBookingSchema.index({ user_id: 1, status: 1 });
demoBookingSchema.index({ status: 1 });

module.exports = mongoose.model('DemoBooking', demoBookingSchema);

// models/ContactInquiry.js
const contactInquirySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  },
  inquiry_type: {
    type: String,
    enum: ['general', 'partnership', 'product', 'support'],
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  company: String,
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved'],
    default: 'new'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

contactInquirySchema.index({ status: 1 });

module.exports = mongoose.model('ContactInquiry', contactInquirySchema);

// models/ProductInquiry.js
const productInquirySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  },
  product_id: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  company: String,
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'quoted', 'ordered', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

productInquirySchema.index({ user_id: 1 });

module.exports = mongoose.model('ProductInquiry', productInquirySchema);

// models/NewsletterSubscription.js
const newsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscribed_at: {
    type: Date,
    default: Date.now
  },
  unsubscribed_at: Date,
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  }
});

newsletterSubscriptionSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);

// models/BlogPost.js
const blogPostSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true
  },
  featured_image_url: String,
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  published_at: Date
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for performance
blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ status: 1, published_at: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
```


### 4.4 Data Access Control (Phase 3)

Implement access control using Express.js middleware:

**Access Control Principles:**
- Users can view their own data (bookings, inquiries, profile)
- Admins can view all data
- Published blog posts are public
- Draft blog posts are admin-only
- Form submissions are accessible to admins

**Express.js Middleware Implementation:**

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const UserProfile = require('../models/UserProfile');

// Verify JWT token and attach user to request
async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserProfile.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Require admin role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };

// Example protected routes
const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('./middleware/auth');
const DemoBooking = require('./models/DemoBooking');

// Users can view their own bookings
router.get('/api/bookings', requireAuth, async (req, res) => {
  try {
    const bookings = await DemoBooking.find({ user_id: req.user._id });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Admins can view all bookings
router.get('/api/admin/bookings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const bookings = await DemoBooking.find({});
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});
```


## 5. API Design

### 5.1 Backend API Configuration

The backend API will be implemented using Node.js with Express.js. Below are the configuration and setup patterns.

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

```typescript
// Frontend API client configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### 5.2 Authentication API

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserProfile = require('../models/UserProfile');

// Sign up with email
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Check if user exists
    const existingUser = await UserProfile.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = new UserProfile({
      email,
      password_hash,
      full_name,
      role: 'user'
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Sign in with email
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await UserProfile.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Get current user
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    _id: req.user._id,
    email: req.user.email,
    full_name: req.user.full_name,
    role: req.user.role
  });
});

// Sign out (client-side token removal)
router.post('/signout', (req, res) => {
  res.json({ message: 'Signed out successfully' });
});

module.exports = router;
```

```typescript
// Frontend authentication functions
async function signUp(email: string, password: string, fullName?: string) {
  const response = await apiClient.post<{ token: string; user: UserProfile }>('/auth/signup', {
    email,
    password,
    full_name: fullName
  });
  
  apiClient.setAuthToken(response.token);
  localStorage.setItem('auth_token', response.token);
  
  return response;
}

async function signIn(email: string, password: string) {
  const response = await apiClient.post<{ token: string; user: UserProfile }>('/auth/signin', {
    email,
    password
  });
  
  apiClient.setAuthToken(response.token);
  localStorage.setItem('auth_token', response.token);
  
  return response;
}

async function signOut() {
  await apiClient.post('/auth/signout', {});
  apiClient.setAuthToken(null);
  localStorage.removeItem('auth_token');
}

async function getSession() {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  
  try {
    apiClient.setAuthToken(token);
    const user = await apiClient.get<UserProfile>('/auth/me');
    return { user, token };
  } catch (error) {
    localStorage.removeItem('auth_token');
    return null;
  }
}
```


### 5.3 Database API Operations

**Backend Express Routes:**

```javascript
// routes/bookings.js
const express = require('express');
const router = express.Router();
const DemoBooking = require('../models/DemoBooking');
const { sendEmail } = require('../services/email');

// Create demo booking
router.post('/', async (req, res) => {
  try {
    const booking = new DemoBooking({
      ...req.body,
      status: 'pending'
    });

    await booking.save();

    // Send confirmation email
    await sendEmail({
      to: booking.email,
      subject: 'Demo Booking Confirmation',
      html: `<p>Your demo has been booked for ${booking.preferred_date} at ${booking.preferred_time}</p>`
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user's bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await DemoBooking.find({ user_id: req.params.userId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;

// routes/inquiries.js
const ContactInquiry = require('../models/ContactInquiry');

router.post('/', async (req, res) => {
  try {
    const inquiry = new ContactInquiry({
      ...req.body,
      status: 'new'
    });

    await inquiry.save();
    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

// routes/newsletter.js
const NewsletterSubscription = require('../models/NewsletterSubscription');

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if already subscribed
    const existing = await NewsletterSubscription.findOne({ email });
    if (existing) {
      if (existing.status === 'active') {
        return res.status(200).json({ message: 'Already subscribed' });
      }
      // Reactivate subscription
      existing.status = 'active';
      existing.unsubscribed_at = null;
      await existing.save();
      return res.json(existing);
    }

    const subscription = new NewsletterSubscription({ email, status: 'active' });
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(200).json({ message: 'Already subscribed' });
    }
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// routes/blog.js
const BlogPost = require('../models/BlogPost');

// Get published blog posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await BlogPost.find({ status: 'published' })
      .sort({ published_at: -1 })
      .populate('author_id', 'full_name email');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get blog post by slug
router.get('/posts/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug })
      .populate('author_id', 'full_name email');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Admin routes
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Create blog post (admin only)
router.post('/admin/posts', requireAuth, requireAdmin, async (req, res) => {
  try {
    const post = new BlogPost({
      ...req.body,
      author_id: req.user._id
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update blog post (admin only)
router.put('/admin/posts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});
```

**Frontend API Functions:**

```typescript
// Demo booking operations
async function createDemoBooking(booking: Omit<DemoBooking, '_id' | 'created_at' | 'updated_at' | 'status'>) {
  const data = await apiClient.post<DemoBooking>('/api/bookings', {
    ...booking,
    status: 'pending'
  });
  return data;
}

async function getUserDemoBookings(userId: string) {
  const data = await apiClient.get<DemoBooking[]>(`/api/bookings/user/${userId}`);
  return data;
}

// Contact inquiry operations
async function createContactInquiry(inquiry: Omit<ContactInquiry, '_id' | 'created_at' | 'updated_at' | 'status'>) {
  const data = await apiClient.post<ContactInquiry>('/api/inquiries', {
    ...inquiry,
    status: 'new'
  });
  return data;
}

// Newsletter subscription operations
async function subscribeToNewsletter(email: string) {
  try {
    const data = await apiClient.post<NewsletterSubscription>('/api/newsletter/subscribe', {
      email,
      status: 'active'
    });
    return data;
  } catch (error) {
    if (error.message.includes('duplicate') || error.message.includes('already exists')) {
      throw new Error('Email already subscribed');
    }
    throw error;
  }
}

// Blog post operations
async function getPublishedBlogPosts() {
  const data = await apiClient.get<BlogPostDB[]>('/api/blog/posts');
  return data;
}

async function getBlogPostBySlug(slug: string) {
  const data = await apiClient.get<BlogPostDB>(`/api/blog/posts/${slug}`);
  return data;
}

async function createBlogPost(post: Omit<BlogPostDB, '_id' | 'created_at' | 'updated_at'>) {
  const data = await apiClient.post<BlogPostDB>('/api/blog/admin/posts', post);
  return data;
}

async function updateBlogPost(id: string, updates: Partial<BlogPostDB>) {
  const data = await apiClient.put<BlogPostDB>(`/api/blog/admin/posts/${id}`, updates);
  return data;
}
```


### 5.4 Storage API (Media Uploads)

**Backend Implementation (using Multer and cloud storage):**

```javascript
// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { requireAuth } = require('../middleware/auth');

// Configure S3 client (or use Cloudinary as alternative)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload image
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const key = `uploads/${fileName}`;

    // Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read'
    }));

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete image
router.delete('/', requireAuth, async (req, res) => {
  try {
    const { url } = req.query;
    const key = url.split('.com/')[1]; // Extract key from URL

    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    }));

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
```

**Frontend Functions:**

```typescript
// Upload image to backend storage
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const { url } = await response.json();
  return url;
}

// Delete image from storage
async function deleteImage(url: string) {
  await apiClient.delete(`/api/upload?url=${encodeURIComponent(url)}`);
}
```

### 5.5 Email Notifications

**Backend Email Service (using Nodemailer or SendGrid):**

```javascript
// services/email.js
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Alternative: SendGrid
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    
    // Alternative: SendGrid
    // await sgMail.send({ from: process.env.EMAIL_FROM, to, subject, html });
    
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

module.exports = { sendEmail };
```

**Usage in routes:**

```javascript
// routes/bookings.js
const { sendEmail } = require('../services/email');

router.post('/', async (req, res) => {
  const booking = new DemoBooking(req.body);
  await booking.save();
  
  // Send confirmation email
  await sendEmail({
    to: booking.email,
    subject: 'Demo Booking Confirmation - Earth Observation Platform',
    html: `
      <h1>Demo Booking Confirmed</h1>
      <p>Hi ${booking.full_name},</p>
      <p>Your demo has been booked for <strong>${booking.preferred_date}</strong> at <strong>${booking.preferred_time}</strong>.</p>
      <p>We'll send you a calendar invite shortly.</p>
      <p>Best regards,<br>Earth Observation Platform Team</p>
    `
  });
  
  res.json(booking);
});
```


## 6. Animation and Interaction Specifications

### 6.1 Animation Library Configuration

```typescript
// Framer Motion configuration
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

// Global animation variants
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

### 6.2 Hero Section Animations

```typescript
// Coordinates typing animation
function 

## 6. Animation and Interaction Specifications

### 6.1 Animation Principles

- **Performance**: All animations run at 60fps using GPU-accelerated properties (transform, opacity)
- **Accessibility**: Respect `prefers-reduced-motion` media query
- **Progressive Enhancement**: Content visible without animations, enhanced with motion
- **Timing**: Use consistent easing functions (ease-out for entrances, ease-in for exits)

### 6.2 Core Animation Patterns

**Fade In on Scroll:**
- Trigger when element enters viewport
- Duration: 600ms
- Easing: ease-out
- Used for: Section content, cards, images

**Slide Up on Scroll:**
- Start 50px below final position
- Fade in while sliding
- Duration: 600ms
- Used for: Text blocks, feature cards

**Stagger Children:**
- Parent container triggers children animations sequentially
- Delay between children: 100ms
- Used for: Product cards, partner logos, feature grids

**Typing Effect:**
- Character-by-character reveal
- Speed: 50ms per character
- Used for: Hero coordinates overlay

**Marquee Scroll:**
- Continuous horizontal scroll
- Speed: 50px per second
- Seamless loop with duplicated content
- Pause on hover
- Used for: Partner logos, trusted by section

**Hover Effects:**
- Scale: 1.05 on hover
- Duration: 200ms
- Easing: ease-in-out
- Used for: Cards, buttons, logos

**Navigation Transparency:**
- Transparent background when at top
- Solid background with blur when scrolled
- Transition: 300ms
- Trigger: scroll position > 50px


### 6.3 Component-Specific Animations

**Hero Section:**
- Background image: Subtle parallax effect on scroll
- Coordinates overlay: Typing animation on mount
- Detection boxes: Float animation (random positions, 3-5s duration)
- Main heading: Fade in with 300ms delay
- CTA button: Scale on hover, pulse effect

**Product Carousel:**
- Slide transition: 400ms ease-in-out
- Auto-play interval: 5000ms
- Touch/swipe: Follow finger with momentum
- Navigation dots: Scale active dot

**Industry Tabs:**
- Tab switch: Fade out old content (200ms), fade in new content (400ms)
- Active indicator: Slide to active tab (300ms)
- Content image: Fade in with slight zoom

**Scroll-Triggered Animations:**
- Trigger threshold: 20% of element visible
- Once triggered: Animation plays once (no repeat)
- Batch animations: Group nearby elements to prevent jank

### 6.4 Mobile Interactions

**Touch Gestures:**
- Swipe left/right: Navigate carousel/tabs
- Swipe threshold: 50px
- Velocity threshold: 0.5px/ms
- Pull-to-refresh: Disabled (not needed)

**Mobile Menu:**
- Slide in from right: 300ms ease-out
- Backdrop fade in: 200ms
- Close on backdrop click or swipe right

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px


## 7. State Management

### 7.1 State Management Strategy

The application uses a hybrid approach:

1. **React Context**: Global state (auth, theme, user preferences)
2. **Component State**: Local UI state (form inputs, modals, dropdowns)
3. **URL State**: Navigation and filters (React Router)
4. **Server State**: Backend API calls with caching (Phase 3)

### 7.2 Authentication Context

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ... implementation of auth methods

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 7.3 UI State Management

```typescript
// Navigation state
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [isScrolled, setIsScrolled] = useState(false);

// Carousel state
const [activeSlide, setActiveSlide] = useState(0);
const [isAutoPlaying, setIsAutoPlaying] = useState(true);

// Tab state
const [activeTab, setActiveTab] = useState('financial-services');

// Form state
const [formData, setFormData] = useState<FormData>({});
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

### 7.4 Data Fetching Strategy

```typescript
// Custom hook for fetching blog posts
function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getPublishedBlogPosts();
        setPosts(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return { posts, loading, error };
}

// Polling for updates (Phase 3)
function usePollingDemoBookings(userId: string, interval: number = 30000) {
  const [bookings, setBookings] = useState<DemoBooking[]>([]);

  useEffect(() => {
    // Initial fetch
    getUserDemoBookings(userId).then(setBookings);

    // Poll for updates
    const intervalId = setInterval(async () => {
      const updated = await getUserDemoBookings(userId);
      setBookings(updated);
    }, interval);

    return () => clearInterval(intervalId);
  }, [userId, interval]);

  return bookings;
}
```


## 8. Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing the acceptance criteria, several properties can be consolidated:
- Navigation routing (3.1.6) and product linking (3.11.3) both test link correctness and can be combined into a general "routing correctness" property
- Form validation properties (3.20.3, 3.23.1) test similar validation logic and can be combined
- Data persistence properties (3.19.2, 3.18.4) test the same round-trip pattern

### 8.1 Navigation and Routing Properties

**Property 1: Navigation Link Routing**
*For any* navigation link in the header or footer, clicking the link should navigate to the correct page matching its href attribute.
**Validates: Requirements 3.1.6**

**Property 2: Sticky Navigation Visibility**
*For any* scroll position greater than 0, the navigation bar should remain visible with fixed positioning at the top of the viewport.
**Validates: Requirements 3.1.1**

**Property 3: Product Detail Routing**
*For any* product in the product list, clicking the product card or detail link should navigate to the correct product detail page with matching product ID.
**Validates: Requirements 3.11.3**

### 8.2 Animation and Interaction Properties

**Property 4: Typing Animation Character Sequence**
*For any* coordinate string in the hero overlay, the typing animation should reveal characters sequentially from left to right at the configured speed.
**Validates: Requirements 3.2.2**

**Property 5: Carousel Infinite Loop**
*For any* carousel at the last slide, advancing forward should return to the first slide without gaps or visual discontinuity.
**Validates: Requirements 3.3.3**

**Property 6: Swipe Gesture Navigation**
*For any* swipe gesture exceeding the threshold distance on a carousel or tab component, the component should navigate in the direction of the swipe.
**Validates: Requirements 3.4.4, 3.5.4**

**Property 7: Industry Tab Content Display**
*For any* industry tab, clicking the tab should display the corresponding industry content (image and description) and mark the tab as active.
**Validates: Requirements 3.5.2**

### 8.3 Component Rendering Properties

**Property 8: Product Card Completeness**
*For any* product rendered as a card, the card should contain all required elements: image, pricing badge (if applicable), title, description, and CTA links.
**Validates: Requirements 3.4.2**

**Property 9: Responsive Layout Adaptation**
*For any* viewport width at mobile (<640px), tablet (640-1024px), or desktop (>1024px) breakpoints, the layout should adapt with appropriate column counts and spacing.
**Validates: Requirements 3.24.5**

**Property 10: Lazy Image Loading**
*For any* image element below the fold, the image should not load until it enters the viewport threshold (within 200px).
**Validates: Requirements 3.25.2**


### 8.4 Form and Data Validation Properties

**Property 11: Email Validation**
*For any* email input in newsletter signup or contact forms, invalid email formats should be rejected with an appropriate error message.
**Validates: Requirements 3.23.1, 3.20.3**

**Property 12: Form Validation Rejection**
*For any* form with required fields, submitting with empty or invalid required fields should prevent submission and display field-specific error messages.
**Validates: Requirements 3.20.3**

**Property 13: Duplicate Email Handling**
*For any* email already subscribed to the newsletter, attempting to subscribe again should complete without error and inform the user they're already subscribed.
**Validates: Requirements 3.23.3**

### 8.5 Backend Integration Properties (Phase 3)

**Property 14: Authentication Round Trip**
*For any* valid email and password combination, signing up should create a user account, and subsequently signing in with the same credentials should succeed and return a valid session.
**Validates: Requirements 3.18.1, 3.18.2**

**Property 15: Data Persistence Round Trip**
*For any* valid demo booking submission, the data should be stored in the database and retrievable by querying with the booking ID.
**Validates: Requirements 3.19.2**

**Property 16: Role-Based Access Control**
*For any* admin-only route or resource, attempting to access it with a non-admin user should be denied, while admin users should have access.
**Validates: Requirements 3.18.5**

**Property 17: Image Upload Round Trip**
*For any* valid image file uploaded through the CMS, the upload should succeed, return a public URL, and the image should be accessible at that URL.
**Validates: Requirements 3.21.3**

**Property 18: Rich Text Formatting Preservation**
*For any* blog post content with rich text formatting (bold, italic, lists, links), saving and retrieving the post should preserve all formatting.
**Validates: Requirements 3.21.2**

### 8.6 Search and Filter Properties

**Property 19: Blog Search Filtering**
*For any* search query on the blog page, all returned results should contain the search term in either the title, excerpt, or tags.
**Validates: Requirements 3.16.2**

**Property 20: Pricing Calculator Validity**
*For any* valid input to the pricing calculator (data type, coverage area, frequency), the calculator should return a non-negative price with appropriate currency formatting.
**Validates: Requirements 3.13.1**


## 9. Error Handling

### 9.1 Error Handling Strategy

**Client-Side Errors:**
- Form validation errors: Display inline field-level errors
- Network errors: Show toast notifications with retry options
- Authentication errors: Redirect to login with error message
- 404 errors: Display custom 404 page with navigation

**Server-Side Errors:**
- Database errors: Log to console, show generic user-friendly message
- Authentication errors: Clear session, redirect to login
- Authorization errors: Show 403 page or redirect to home
- Rate limiting: Show "too many requests" message with retry timer

### 9.2 Error Boundaries

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    // Log to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 9.3 Form Error Handling

```typescript
interface FormErrors {
  [field: string]: string;
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return errors;
}

// Usage in component
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const errors = validateForm(formData);
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return;
  }

  try {
    await submitForm(formData);
    setSuccess(true);
  } catch (error) {
    setErrors({ submit: 'Failed to submit form. Please try again.' });
  }
};
```

### 9.4 API Error Handling

```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await apiCall();
    return { data };
  } catch (error) {
    if (error instanceof Error) {
      // Handle common API errors
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        return { error: 'This record already exists' };
      }
      if (error.message.includes('permission denied') || error.message.includes('forbidden')) {
        return { error: 'You do not have permission to perform this action' };
      }
      if (error.message.includes('unauthorized')) {
        return { error: 'Please sign in to continue' };
      }
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
}

// Usage
const { data, error } = await handleApiCall(() => createDemoBooking(booking));
if (error) {
  showToast(error, 'error');
} else {
  showToast('Booking created successfully!', 'success');
}
```

### 9.5 Loading States

```typescript
// Loading skeleton for content
function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-700 rounded-t-lg" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

// Suspense boundaries for code splitting
<Suspense fallback={<LoadingSpinner />}>
  <LazyLoadedComponent />
</Suspense>
```


## 10. Testing Strategy

### 10.1 Testing Approach

The application uses a dual testing approach combining unit tests and property-based tests:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property-based tests**: Verify universal properties across randomized inputs
- Both approaches are complementary and necessary for comprehensive coverage

### 10.2 Testing Stack

**Testing Framework:**
- Vitest for unit and property-based tests
- React Testing Library for component testing
- fast-check for property-based testing
- Playwright for end-to-end tests (optional, Phase 3)

**Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
});
```

### 10.3 Property-Based Testing Configuration

Each property-based test must:
- Run minimum 100 iterations (due to randomization)
- Reference its design document property in a comment
- Use the tag format: `Feature: earth-intelligence-platform, Property {number}: {property_text}`

```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

// Feature: earth-intelligence-platform, Property 1: Navigation Link Routing
describe('Navigation Link Routing', () => {
  it('should navigate to correct page for any navigation link', () => {
    fc.assert(
      fc.property(
        fc.record({
          label: fc.string({ minLength: 1 }),
          href: fc.webPath()
        }),
        (navLink) => {
          // Test that clicking link navigates to href
          const link = render(<NavLink {...navLink} />);
          expect(link.getAttribute('href')).toBe(navLink.href);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 10.4 Unit Testing Strategy

Unit tests should focus on:
- Specific examples that demonstrate correct behavior
- Edge cases (empty inputs, boundary values, special characters)
- Error conditions and error handling
- Integration points between components

**Avoid writing too many unit tests** - property-based tests handle comprehensive input coverage. Unit tests should complement, not duplicate, property tests.

```typescript
// Example unit test
describe('NewsletterForm', () => {
  it('should display error for empty email', async () => {
    const { getByRole, getByText } = render(<NewsletterForm />);
    const submitButton = getByRole('button', { name: /subscribe/i });
    
    fireEvent.click(submitButton);
    
    expect(getByText(/email is required/i)).toBeInTheDocument();
  });

  it('should display error for invalid email format', async () => {
    const { getByRole, getByText } = render(<NewsletterForm />);
    const emailInput = getByRole('textbox', { name: /email/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(getByRole('button', { name: /subscribe/i }));
    
    expect(getByText(/invalid email format/i)).toBeInTheDocument();
  });
});
```


### 10.5 Component Testing Examples

```typescript
// Testing responsive behavior
describe('ProductGrid', () => {
  it('should display 1 column on mobile', () => {
    window.innerWidth = 375;
    const { container } = render(<ProductGrid products={mockProducts} />);
    const grid = container.querySelector('.product-grid');
    expect(grid).toHaveClass('grid-cols-1');
  });

  it('should display 2 columns on tablet', () => {
    window.innerWidth = 768;
    const { container } = render(<ProductGrid products={mockProducts} />);
    const grid = container.querySelector('.product-grid');
    expect(grid).toHaveClass('md:grid-cols-2');
  });
});

// Testing animation triggers
describe('FadeInOnScroll', () => {
  it('should trigger animation when element enters viewport', () => {
    const { container } = render(
      <FadeInOnScroll>
        <div data-testid="content">Content</div>
      </FadeInOnScroll>
    );

    const element = container.firstChild;
    
    // Simulate intersection observer
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    
    window.IntersectionObserver = mockIntersectionObserver;
    
    // Verify animation class is applied
    expect(element).toHaveClass('animate-fade-in');
  });
});
```

### 10.6 Integration Testing (Phase 3)

```typescript
// Testing Supabase integration
describe('Demo Booking Flow', () => {
  it('should create booking and send confirmation email', async () => {
    const booking = {
      full_name: 'John Doe',
      email: 'john@example.com',
      preferred_date: '2024-02-01',
      preferred_time: '14:00',
      message: 'Interested in Analytics product'
    };

    // Create booking
    const result = await createDemoBooking(booking);
    expect(result.id).toBeDefined();
    expect(result.status).toBe('pending');

    // Verify it's stored
    const retrieved = await supabase
      .from('demo_bookings')
      .select('*')
      .eq('id', result.id)
      .single();
    
    expect(retrieved.data).toMatchObject(booking);
  });
});

// Testing authentication flow
describe('Authentication', () => {
  it('should sign up, sign in, and access protected route', async () => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'SecurePassword123!';

    // Sign up
    const signUpResult = await signUp(email, password);
    expect(signUpResult.user).toBeDefined();

    // Sign in
    const signInResult = await signIn(email, password);
    expect(signInResult.session).toBeDefined();

    // Access protected route
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', signInResult.user.id)
      .single();
    
    expect(data).toBeDefined();
  });
});
```

### 10.7 Test Coverage Goals

- **Unit test coverage**: > 80% for utility functions and business logic
- **Component test coverage**: > 70% for React components
- **Property test coverage**: 100% of correctness properties implemented
- **Integration test coverage**: All critical user flows (auth, forms, data persistence)

### 10.8 Continuous Integration

Tests should run automatically on:
- Every commit (pre-commit hook)
- Every pull request (CI pipeline)
- Before deployment (pre-deploy check)

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
```


## 11. Performance Optimization

### 11.1 Performance Goals

- Page load time: < 3 seconds
- First Contentful Paint (FCP): < 1.5 seconds
- Time to Interactive (TTI): < 3 seconds
- Lighthouse Performance score: > 90
- Animation frame rate: 60fps

### 11.2 Optimization Strategies

**Code Splitting:**
```typescript
// Lazy load route components
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const AdminCMSPage = lazy(() => import('./pages/AdminCMSPage'));

// Route configuration with lazy loading
<Route path="/products" element={
  <Suspense fallback={<LoadingSpinner />}>
    <ProductsPage />
  </Suspense>
} />
```

**Image Optimization:**
```typescript
// Use modern image formats with fallbacks
<picture>
  <source srcSet="/hero.webp" type="image/webp" />
  <source srcSet="/hero.jpg" type="image/jpeg" />
  <img src="/hero.jpg" alt="Hero" loading="lazy" />
</picture>

// Responsive images
<img
  srcSet="/product-sm.jpg 640w, /product-md.jpg 1024w, /product-lg.jpg 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  src="/product-md.jpg"
  alt="Product"
  loading="lazy"
/>
```

**Asset Optimization:**
- Compress images (WebP format, quality 80-85%)
- Minify CSS and JavaScript
- Use CDN for static assets
- Enable gzip/brotli compression
- Implement HTTP/2 server push for critical resources

**Bundle Optimization:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### 11.3 Caching Strategy

**Browser Caching:**
```typescript
// Service worker for offline support (optional)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

**API Response Caching:**
```typescript
// Cache blog posts for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
const cache = new Map<string, { data: any; timestamp: number }>();

async function getCachedBlogPosts() {
  const cached = cache.get('blog_posts');
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await getPublishedBlogPosts();
  cache.set('blog_posts', { data, timestamp: Date.now() });
  return data;
}
```

### 11.4 Animation Performance

```typescript
// Use CSS transforms for better performance
const animationStyles = {
  transform: 'translateX(0)',
  transition: 'transform 0.3s ease-out',
  willChange: 'transform' // Hint to browser for optimization
};

// Throttle scroll events
import { throttle } from 'lodash-es';

const handleScroll = throttle(() => {
  // Scroll handling logic
}, 100);

useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### 11.5 Database Query Optimization (Phase 3)

```sql
-- Use indexes for frequently queried columns
CREATE INDEX idx_blog_posts_status_published ON blog_posts(status, published_at DESC);
CREATE INDEX idx_demo_bookings_user_status ON demo_bookings(user_id, status);

-- Use pagination for large result sets
SELECT * FROM blog_posts
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10 OFFSET 0;
```

```typescript
// Implement pagination in API calls
async function getPaginatedBlogPosts(page: number = 1, pageSize: number = 10) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    posts: data,
    totalPages: Math.ceil((count || 0) / pageSize),
    currentPage: page
  };
}
```


## 12. Accessibility

### 12.1 Accessibility Standards

The application must meet WCAG 2.1 Level AA compliance:

- Color contrast ratio: minimum 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation: all interactive elements accessible via keyboard
- Screen reader support: semantic HTML and ARIA labels
- Focus indicators: visible focus states for all interactive elements
- Alternative text: descriptive alt text for all images

### 12.2 Semantic HTML

```typescript
// Use semantic HTML elements
<nav aria-lab

## 12. Accessibility

### 12.1 Accessibility Standards

The application must meet WCAG 2.1 Level AA compliance:
- Color contrast ratio: minimum 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation: all interactive elements accessible via keyboard
- Screen reader support: semantic HTML and ARIA labels
- Focus indicators: visible focus states for all interactive elements
- Alternative text: descriptive alt text for all images

### 12.2 Implementation Guidelines

**Semantic HTML:**
```typescript
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/products">Products</a></li>
  </ul>
</nav>

<main id="main-content">
  <h1>Page Title</h1>
  <section aria-labelledby="products-heading">
    <h2 id="products-heading">Our Products</h2>
  </section>
</main>
```

**Keyboard Navigation:**
- Tab order follows logical reading order
- Skip to main content link for screen readers
- Escape key closes modals and dropdowns
- Arrow keys navigate carousels and tabs

**ARIA Labels:**
```typescript
<button aria-label="Close menu" onClick={closeMenu}>
  <XIcon aria-hidden="true" />
</button>

<div role="tablist" aria-label="Industry categories">
  <button role="tab" aria-selected={isActive} aria-controls="panel-1">
    Financial Services
  </button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  Content
</div>
```

**Focus Management:**
```typescript
// Trap focus in modal
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    firstElement?.focus();
  }
}, [isOpen]);
```

**Reduced Motion:**
```typescript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationVariants = prefersReducedMotion
  ? { hidden: {}, visible: {} }
  : { hidden: { opacity: 0 }, visible: { opacity: 1 } };
```


## 13. Security Considerations

### 13.1 Authentication Security

- Passwords hashed with bcrypt or similar (handled by backend)
- Session tokens stored securely (httpOnly cookies or secure localStorage)
- CSRF protection enabled
- Rate limiting on authentication endpoints
- Email verification for new accounts (optional)

### 13.2 Authorization

- Access control policies enforce data access
- Admin routes protected with role checks
- API calls validate user permissions server-side
- Never trust client-side authorization alone

### 13.3 Input Validation

```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target']
  });
}

// Validate and sanitize form inputs
function validateContactForm(data: ContactFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Prevent XSS
  data.message = sanitizeHtml(data.message);
  
  // Validate email
  if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Prevent SQL injection (handled by Supabase parameterized queries)
  // Prevent excessively long inputs
  if (data.message.length > 5000) {
    errors.message = 'Message too long';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
```

### 13.4 Environment Variables

**Frontend (.env):**
```bash
# Frontend environment variables
VITE_API_BASE_URL=http://localhost:3000
```

**Backend (.env):**
```bash
# Server configuration
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/earth-intelligence-platform
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/earth-intelligence-platform

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Email Service (Nodemailer SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@earthintelligence.com

# Alternative: SendGrid
# SENDGRID_API_KEY=your_sendgrid_api_key

# AWS S3 (for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=earth-intelligence-uploads

# Alternative: Cloudinary
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Never commit actual .env file - add to .gitignore
```

### 13.5 Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://your-api-domain.com;">
```

## 14. Deployment

### 14.1 Build Process

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

### 14.2 Environment Configuration

**Development:**
- Local backend instance or development API
- Hot module replacement enabled
- Source maps enabled
- Verbose error messages

**Production:**
- Production backend API
- Minified and optimized bundles
- Source maps disabled or uploaded to error tracking
- Generic error messages for users

### 14.3 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Access control policies enabled
- [ ] Storage configured with correct permissions
- [ ] Email service configured
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics tracking configured
- [ ] Error monitoring configured
- [ ] Performance monitoring enabled

## 15. Future Enhancements

### 15.1 Phase 4 Considerations (Out of Scope)

- Multi-language support (i18n)
- Advanced analytics dashboard with charts
- Real-time satellite tracking map
- Payment processing integration
- Mobile native apps (React Native)
- Public API for third-party integrations
- Advanced search with Elasticsearch
- Video content and tutorials
- Live chat support
- A/B testing framework

### 15.2 Technical Debt to Address

- Implement comprehensive E2E test suite
- Add performance monitoring and alerting
- Optimize bundle size further
- Implement progressive web app (PWA) features
- Add comprehensive error tracking
- Document component API with Storybook
- Implement automated accessibility testing



## 9. Missing Pages Implementation (Completed)

### 9.1 Form Pages Architecture

All form pages follow a consistent pattern using React Hook Form with Zod validation:

```typescript
// Shared form pattern
const FormPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    await handleFormSubmission(data, { successTitle, successDescription, onSuccess: reset });
    setIsSubmitting(false);
  };
  
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
};
```

### 9.2 Book Demo Page (`/demo`)

**Component Structure:**
- Hero section with title and description
- Form card with shadcn/ui Card component
- Form fields: fullName, email, companyName, phoneNumber, jobTitle, message
- Submit button with loading state
- Toast notifications for success/error

**Validation Schema:**
```typescript
const bookDemoSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  companyName: z.string().min(2).max(100),
  phoneNumber: z.string().regex(/^[\d\s\-\+\(\)]+$/).min(10),
  jobTitle: z.string().min(2).max(100),
  message: z.string().min(10).max(1000),
});
```

### 9.3 Sign In Page (`/auth/signin`)

**Component Structure:**
- Centered authentication card (max-width: 450px)
- Email and password inputs
- Password visibility toggle (Eye icon)
- "Forgot Password?" link → `/auth/forgot-password`
- "Don't have an account? Sign up" link → `/auth/signup`
- Submit button with loading state

**Validation Schema:**
```typescript
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### 9.4 Sign Up Page (`/auth/signup`)

**Component Structure:**
- Centered registration card
- Form fields: fullName, email, companyName, password, confirmPassword
- Password strength validation (uppercase, lowercase, number)
- Password visibility toggles for both fields
- Terms & Conditions checkbox with links to `/terms` and `/privacy`
- "Already have an account? Sign in" link → `/auth/signin`

**Validation Schema:**
```typescript
const signUpSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  companyName: z.string().min(2).max(100),
  password: z.string().min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### 9.5 Forgot Password Page (`/auth/forgot-password`)

**Component Structure:**
- Two-state UI: Initial form and Success confirmation
- Email input field
- "Send Reset Link" button
- Success state with helpful instructions
- "Try Another Email" and "Back to Sign In" buttons
- "Contact Support" link

**Validation Schema:**
```typescript
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
```

### 9.6 Contact Page (`/contact`)

**Component Structure:**
- Two-column layout (desktop) / single-column (mobile)
- Contact information card with icons (Mail, Phone, MapPin)
- Contact form with fields: fullName, email, subject, message
- Grid layout: `grid-cols-1 lg:grid-cols-2 gap-8`

**Validation Schema:**
```typescript
const contactSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});
```

### 9.7 Privacy Policy Page (`/privacy`)

**Component Structure:**
- Hero section with title and last updated date
- Two-column layout: Sticky TOC sidebar (desktop) + content
- Table of contents with smooth scroll anchor links
- Content sections with proper heading hierarchy
- ScrollArea component for long TOC lists

**Sections:**
1. Introduction
2. Information We Collect
3. How We Use Your Information
4. Data Sharing and Disclosure
5. Cookies and Tracking Technologies
6. Your Rights and Choices
7. Data Security
8. International Data Transfers
9. Children's Privacy
10. Changes to This Policy
11. Contact Us

### 9.8 Terms of Service Page (`/terms`)

**Component Structure:**
- Identical layout to Privacy Policy page
- Hero section with title and last updated date
- Sticky table of contents
- Content sections with proper heading hierarchy

**Sections:**
1. Acceptance of Terms
2. Description of Service
3. User Accounts and Registration
4. Acceptable Use Policy
5. Intellectual Property Rights
6. Payment and Billing
7. Service Modifications and Availability
8. Limitation of Liability
9. Indemnification
10. Termination
11. Governing Law and Dispute Resolution
12. Contact Information

### 9.9 Request Quote Page (`/quote`)

**Component Structure:**
- Hero section with title and description
- Form card with multiple field types
- Select dropdowns for industry and data volume
- Grid layout for form fields: `grid-cols-1 md:grid-cols-2`

**Validation Schema:**
```typescript
const quoteSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  companyName: z.string().min(2).max(100),
  phoneNumber: z.string().regex(/^[\d\s\-\+\(\)]+$/).min(10),
  industry: z.string().min(1),
  estimatedDataVolume: z.string().min(1),
  requirements: z.string().min(20).max(2000),
});
```

**Industry Options:**
- Financial Services, Agriculture, Energy, Mining, Construction, Government, Environment, Insurance, Other

**Data Volume Options:**
- < 1 TB/month, 1-10 TB/month, 10-50 TB/month, 50-100 TB/month, > 100 TB/month, Not sure

### 9.10 Get Started Page (`/get-started`)

**Component Structure:**
- Hero section with title and description
- Three-step onboarding flow with cards:
  1. Explore Products → `/products`
  2. Book a Demo → `/demo`
  3. Sign Up → `/auth/signup`
- Benefits section with checkmarks
- Pricing preview with CTAs
- Final CTA section with demo and contact buttons

**Step Card Interface:**
```typescript
interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  cta: string;
  link: string;
}
```

### 9.11 Shared Form Utilities

**Form Submission Handler:**
```typescript
// src/lib/form-utils.ts
export const handleFormSubmission = async (
  data: any,
  options: {
    successTitle: string;
    successDescription: string;
    onSuccess?: () => void;
  }
) => {
  // Placeholder for Phase 3 backend integration
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  toast({
    title: options.successTitle,
    description: options.successDescription,
  });
  
  options.onSuccess?.();
};
```

**Form Schemas:**
All validation schemas are centralized in `src/lib/form-schemas.ts` for consistency and reusability.

### 9.12 Routing Configuration

All new routes are registered in `src/App.tsx`:

```typescript
<Route path="/demo" element={<BookDemoPage />} />
<Route path="/get-started" element={<GetStartedPage />} />
<Route path="/auth/signin" element={<SignInPage />} />
<Route path="/auth/signup" element={<SignUpPage />} />
<Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/contact" element={<ContactPage />} />
<Route path="/privacy" element={<PrivacyPolicyPage />} />
<Route path="/terms" element={<TermsOfServicePage />} />
<Route path="/quote" element={<RequestQuotePage />} />
```

### 9.13 Design Consistency

All pages follow these design principles:
- Dark theme with consistent color scheme
- shadcn/ui components for UI elements
- Framer Motion for animations (fadeInUp pattern)
- Responsive design with Tailwind breakpoints
- Consistent spacing and typography
- Toast notifications for user feedback
- Loading states on all submit buttons
- Inline error messages below form fields

### 9.14 Accessibility Features

All pages implement:
- Proper ARIA labels for form inputs
- aria-invalid and aria-describedby for error states
- Keyboard navigation support
- Proper heading hierarchy (h1 → h2 → h3)
- Visible labels or placeholders for all inputs
- Focus indicators for interactive elements
- Password visibility toggles with aria-labels

### 9.15 Backend Integration Readiness (Phase 3)

All forms are structured for easy backend integration:
- Form data is typed with TypeScript interfaces
- Validation schemas can be shared with backend
- Submission handlers use async/await pattern
- Error handling structure is in place
- Success/error states are managed consistently

**Backend Endpoints Needed:**
- `POST /api/demo/book` - Book demo requests
- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Password reset requests
- `POST /api/contact` - Contact form submissions
- `POST /api/quote/request` - Quote requests
- `GET /api/content/privacy` - Privacy policy content
- `GET /api/content/terms` - Terms of service content
