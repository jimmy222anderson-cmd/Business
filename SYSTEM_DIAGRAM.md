# Content Management System - Visual Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────┐        │
│  │   PUBLIC WEBSITE     │         │    ADMIN PANEL       │        │
│  │                      │         │                      │        │
│  │  • Products Page     │         │  • Products Mgmt     │        │
│  │  • Industries Page   │         │  • Industries Mgmt   │        │
│  │  • Blog Page         │         │  • Partners Mgmt     │        │
│  │  • Partners Page     │         │  • Blog Mgmt         │        │
│  │                      │         │                      │        │
│  │  [View Only]         │         │  [Full CRUD]         │        │
│  └──────────────────────┘         └──────────────────────┘        │
│           │                                  │                      │
│           │                                  │                      │
│           └──────────────┬───────────────────┘                      │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           │ REST API
                           │
┌──────────────────────────┼──────────────────────────────────────────┐
│                          │                                          │
│                    API GATEWAY                                      │
│                          │                                          │
│  ┌───────────────────────┴────────────────────────┐               │
│  │                                                 │               │
│  │  ┌──────────────────┐    ┌──────────────────┐ │               │
│  │  │  PUBLIC ROUTES   │    │  ADMIN ROUTES    │ │               │
│  │  │  (No Auth)       │    │  (JWT Required)  │ │               │
│  │  │                  │    │                  │ │               │
│  │  │  GET /products   │    │  POST /products  │ │               │
│  │  │  GET /industries │    │  PUT /products   │ │               │
│  │  │  GET /partners   │    │  DELETE /products│ │               │
│  │  │  GET /blog       │    │  + Industries    │ │               │
│  │  │                  │    │  + Partners      │ │               │
│  │  │                  │    │  + Blog          │ │               │
│  │  └──────────────────┘    └──────────────────┘ │               │
│  │                                                 │               │
│  └─────────────────────────────────────────────────┘               │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                           │ Mongoose ODM
                           │
┌──────────────────────────┼──────────────────────────────────────────┐
│                          │                                          │
│                   DATABASE LAYER                                    │
│                          │                                          │
│  ┌───────────────────────┴────────────────────────┐               │
│  │                                                 │               │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │               │
│  │  │ Products │  │Industries│  │ Partners │    │               │
│  │  │          │  │          │  │          │    │               │
│  │  │ • name   │  │ • name   │  │ • name   │    │               │
│  │  │ • slug   │  │ • slug   │  │ • logo   │    │               │
│  │  │ • desc   │  │ • desc   │  │ • desc   │    │               │
│  │  │ • image  │  │ • image  │  │ • website│    │               │
│  │  │ • status │  │ • status │  │ • status │    │               │
│  │  └──────────┘  └──────────┘  └──────────┘    │               │
│  │                                                 │               │
│  │  ┌──────────┐                                  │               │
│  │  │BlogPosts │                                  │               │
│  │  │          │                                  │               │
│  │  │ • title  │                                  │               │
│  │  │ • slug   │                                  │               │
│  │  │ • content│                                  │               │
│  │  │ • author │                                  │               │
│  │  │ • status │                                  │               │
│  │  └──────────┘                                  │               │
│  │                                                 │               │
│  └─────────────────────────────────────────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Content Creation Flow (Admin)

```
┌─────────┐
│  Admin  │
└────┬────┘
     │
     │ 1. Login
     ▼
┌─────────────┐
│ Admin Panel │
└──────┬──────┘
       │
       │ 2. Navigate to Management Page
       ▼
┌──────────────────┐
│ Products Mgmt    │
│ Industries Mgmt  │
│ Partners Mgmt    │
│ Blog Mgmt        │
└────────┬─────────┘
         │
         │ 3. Click "Add New"
         ▼
┌─────────────────┐
│   Form Page     │
│                 │
│ • Fill fields   │
│ • Upload image  │
│ • Add features  │
└────────┬────────┘
         │
         │ 4. Submit Form
         ▼
┌─────────────────┐
│  API Request    │
│  POST /admin/   │
│  products       │
└────────┬────────┘
         │
         │ 5. Validate & Save
         ▼
┌─────────────────┐
│   Database      │
│   MongoDB       │
└────────┬────────┘
         │
         │ 6. Success Response
         ▼
┌─────────────────┐
│  UI Update      │
│  + Toast        │
│  + Redirect     │
└─────────────────┘
```

### 2. Content Display Flow (Public)

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Visit Page
     ▼
┌─────────────────┐
│ Products Page   │
│ Industries Page │
│ Blog Page       │
└────────┬────────┘
         │
         │ 2. Component Mounts
         ▼
┌─────────────────┐
│  useEffect()    │
│  fetchData()    │
└────────┬────────┘
         │
         │ 3. API Request
         ▼
┌─────────────────┐
│  GET /public/   │
│  products       │
└────────┬────────┘
         │
         │ 4. Query Database
         ▼
┌─────────────────┐
│   MongoDB       │
│   Find Active   │
└────────┬────────┘
         │
         │ 5. JSON Response
         ▼
┌─────────────────┐
│  setState()     │
│  Update UI      │
└────────┬────────┘
         │
         │ 6. Render Content
         ▼
┌─────────────────┐
│  Display Cards  │
│  Show Images    │
│  Enable Search  │
└─────────────────┘
```

### 3. Image Upload Flow

```
┌─────────┐
│  Admin  │
└────┬────┘
     │
     │ 1. Select Image
     ▼
┌─────────────────┐
│ ImageUpload     │
│ Component       │
└────────┬────────┘
         │
         │ 2. Validate File
         │    • Type check
         │    • Size check
         ▼
┌─────────────────┐
│  FormData       │
│  Preparation    │
└────────┬────────┘
         │
         │ 3. Upload Request
         ▼
┌─────────────────┐
│  POST /upload   │
│  with file      │
└────────┬────────┘
         │
         │ 4. Save to Storage
         ▼
┌─────────────────┐
│  File System    │
│  /uploads/      │
└────────┬────────┘
         │
         │ 5. Return URL
         ▼
┌─────────────────┐
│  Image Preview  │
│  + URL stored   │
└─────────────────┘
```

## Component Hierarchy

### Admin Panel Structure

```
App.tsx
│
├── AuthProvider
│   │
│   └── ProtectedRoute (requireAdmin)
│       │
│       ├── AdminDashboardPage
│       │   ├── Statistics Cards
│       │   ├── Quick Actions
│       │   ├── Content Management Links
│       │   └── Recent Activity
│       │
│       ├── ProductsManagementPage
│       │   ├── Header + Add Button
│       │   └── Products Table
│       │       ├── Product Row
│       │       └── Actions (Edit/Delete)
│       │
│       ├── ProductFormPage
│       │   ├── Basic Info Section
│       │   │   ├── Name Input
│       │   │   ├── Slug Input
│       │   │   ├── Description Textarea
│       │   │   └── ImageUpload Component
│       │   ├── Features Section
│       │   │   └── Dynamic Feature Array
│       │   ├── Use Cases Section
│       │   │   └── Dynamic UseCase Array
│       │   └── Specifications Section
│       │       └── Dynamic Spec Array
│       │
│       ├── IndustriesManagementPage
│       ├── IndustryFormPage
│       ├── PartnersManagementPage
│       ├── PartnerFormPage
│       ├── BlogManagementPage
│       └── BlogFormPage
```

### Public Pages Structure

```
App.tsx
│
├── Layout
│   ├── Navbar
│   ├── Outlet (Page Content)
│   └── Footer
│
├── ProductsPage
│   ├── Header
│   └── Products Grid
│       └── ProductCard (map)
│
├── IndustriesPage
│   ├── Hero Section
│   └── Industries Grid
│       └── IndustryCard (map)
│
└── BlogPage
    ├── Header + Search
    └── Blog Grid
        └── BlogCard (map)
```

## Database Schema Relationships

```
┌─────────────────┐
│   UserProfile   │
│                 │
│ • email         │
│ • password_hash │
│ • role          │
└────────┬────────┘
         │
         │ author_id
         │
         ▼
┌─────────────────┐
│   BlogPost      │
│                 │
│ • title         │
│ • content       │
│ • author_id ────┘
│ • status        │
└─────────────────┘


┌─────────────────┐
│    Product      │
│                 │
│ • name          │
│ • slug          │
│ • features[]    │
└────────┬────────┘
         │
         │ relevantProducts[]
         │
         ▼
┌─────────────────┐
│   Industry      │
│                 │
│ • name          │
│ • slug          │
│ • useCases[]    │
│ • products[] ───┘
└─────────────────┘


┌─────────────────┐
│    Partner      │
│                 │
│ • name          │
│ • category      │
│ • logo          │
└─────────────────┘
```

## Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Enter Credentials
     ▼
┌─────────────────┐
│  Login Form     │
└────────┬────────┘
         │
         │ 2. POST /auth/login
         ▼
┌─────────────────┐
│  Backend Auth   │
│  • Verify email │
│  • Check pass   │
│  • Check role   │
└────────┬────────┘
         │
         │ 3. Generate JWT
         ▼
┌─────────────────┐
│  JWT Token      │
│  + User Info    │
└────────┬────────┘
         │
         │ 4. Store in localStorage
         ▼
┌─────────────────┐
│  AuthContext    │
│  • setUser()    │
│  • setToken()   │
└────────┬────────┘
         │
         │ 5. Redirect to Dashboard
         ▼
┌─────────────────┐
│  Admin Panel    │
│  (Protected)    │
└─────────────────┘

         │
         │ 6. All API Requests
         ▼
┌─────────────────┐
│  Authorization  │
│  Header:        │
│  Bearer {token} │
└─────────────────┘
```

## File Structure

```
project-root/
│
├── backend/
│   ├── models/
│   │   ├── Product.js          ✅ New
│   │   ├── Industry.js         ✅ New
│   │   ├── Partner.js          ✅ New
│   │   ├── BlogPost.js         (existing)
│   │   └── index.js            ✅ Updated
│   │
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── products.js     ✅ New
│   │   │   ├── industries.js   ✅ New
│   │   │   ├── partners.js     ✅ New
│   │   │   └── blogs.js        ✅ New
│   │   ├── public/
│   │   │   └── content.js      ✅ New
│   │   ├── admin.js            ✅ Updated
│   │   └── server.js           ✅ Updated
│   │
│   └── scripts/
│       └── migrate-content.js  ✅ New
│
├── src/
│   ├── components/
│   │   ├── ImageUpload.tsx     ✅ New
│   │   └── ScrollToTop.tsx     ✅ New
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── ProductsManagementPage.tsx    ✅ New
│   │   │   ├── IndustriesManagementPage.tsx  ✅ New
│   │   │   ├── PartnersManagementPage.tsx    ✅ New
│   │   │   ├── BlogManagementPage.tsx        ✅ New
│   │   │   ├── ProductFormPage.tsx           ✅ New
│   │   │   ├── IndustryFormPage.tsx          ✅ New
│   │   │   ├── PartnerFormPage.tsx           ✅ New
│   │   │   └── BlogFormPage.tsx              ✅ New
│   │   │
│   │   ├── ProductsPage.tsx    ✅ Updated
│   │   ├── IndustriesPage.tsx  ✅ Updated
│   │   └── BlogPage.tsx        ✅ Updated
│   │
│   └── App.tsx                 ✅ Updated
│
└── Documentation/
    ├── CMS_README.md                    ✅ New
    ├── QUICK_START_GUIDE.md             ✅ New
    ├── ADMIN_PANEL_GUIDE.md             ✅ New
    ├── IMPLEMENTATION_SUMMARY.md        ✅ New
    ├── CMS_IMPLEMENTATION_COMPLETE.md   ✅ New
    ├── CONTENT_MANAGEMENT_SYSTEM.md     ✅ New
    ├── TASK.md                          ✅ New
    ├── DEPLOYMENT_CHECKLIST.md          ✅ New
    ├── FINAL_SUMMARY.md                 ✅ New
    └── SYSTEM_DIAGRAM.md                ✅ This file
```

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                       │
├─────────────────────────────────────────────────────────┤
│  React 18 + TypeScript                                  │
│  ├── React Router (Navigation)                          │
│  ├── Tailwind CSS (Styling)                             │
│  ├── shadcn/ui (Components)                             │
│  ├── Sonner (Notifications)                             │
│  └── Vite (Build Tool)                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ REST API
                          │
┌─────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                        │
├─────────────────────────────────────────────────────────┤
│  Node.js + Express.js                                   │
│  ├── JWT (Authentication)                               │
│  ├── Mongoose (ODM)                                     │
│  ├── Multer (File Upload)                               │
│  ├── Helmet (Security)                                  │
│  └── CORS (Cross-Origin)                                │
└─────────────────────────────────────────────────────────┘
                          │
                          │ MongoDB Driver
                          │
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                        │
├─────────────────────────────────────────────────────────┤
│  MongoDB (NoSQL Database)                               │
│  ├── Collections (Products, Industries, etc.)           │
│  ├── Indexes (Performance)                              │
│  └── Relationships (References)                         │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      USERS                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   CDN / HOSTING                         │
│              (Vercel, Netlify, etc.)                    │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │         React Frontend (Static)               │    │
│  │         • HTML, CSS, JS                       │    │
│  │         • Optimized Build                     │    │
│  └───────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ API Calls
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   API SERVER                            │
│              (AWS, DigitalOcean, etc.)                  │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │         Express Backend                       │    │
│  │         • Node.js Runtime                     │    │
│  │         • PM2 Process Manager                 │    │
│  │         • Nginx Reverse Proxy                 │    │
│  └───────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Database Connection
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE                              │
│              (MongoDB Atlas, etc.)                      │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │         MongoDB Cluster                       │    │
│  │         • Replica Set                         │    │
│  │         • Automated Backups                   │    │
│  │         • Monitoring                          │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

**This diagram provides a visual overview of the entire Content Management System architecture, data flows, and component relationships.**

For detailed implementation information, see the other documentation files.
