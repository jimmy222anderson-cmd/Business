# Earth Observation Platform - Backend API

This is the backend API for the Earth Observation Platform, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Configure email service settings (optional for Phase 3)
   - Configure AWS S3 settings (optional for Phase 3)

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## Project Structure

```
backend/
├── config/           # Configuration files
│   └── database.js   # MongoDB connection setup
├── middleware/       # Express middleware
│   └── auth.js       # Authentication middleware
├── models/           # Mongoose models
│   ├── UserProfile.js
│   ├── DemoBooking.js
│   ├── ContactInquiry.js
│   ├── ProductInquiry.js
│   ├── NewsletterSubscription.js
│   └── BlogPost.js
├── routes/           # API routes
│   └── upload.js     # File upload routes
├── services/         # Business logic services
│   ├── email.js      # Email service
│   └── upload.js     # File upload service
├── .env              # Environment variables (not in git)
├── .env.example      # Example environment variables
├── .gitignore        # Git ignore file
├── package.json      # Dependencies and scripts
└── server.js         # Main application entry point
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Authentication (Phase 3)
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Demo Bookings (Phase 3)
- `POST /api/bookings` - Create demo booking
- `GET /api/bookings/user/:userId` - Get user's bookings
- `GET /api/admin/bookings` - Get all bookings (admin only)
- `PUT /api/admin/bookings/:id/status` - Update booking status (admin only)

### Contact Inquiries (Phase 3)
- `POST /api/inquiries` - Create contact inquiry
- `GET /api/inquiries/user/:userId` - Get user's inquiries
- `GET /api/admin/inquiries` - Get all inquiries (admin only)
- `PUT /api/admin/inquiries/:id/status` - Update inquiry status (admin only)

### Newsletter (Phase 3)
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter

### File Upload (Phase 3)
- `POST /api/upload/image` - Upload image (requires auth)
- `DELETE /api/upload/image` - Delete image (requires auth)

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Admin-only routes require the user to have the `admin` role.

## Database Models

### UserProfile
- email (unique)
- password_hash
- full_name
- company
- role (user/admin)

### DemoBooking
- user_id (optional)
- full_name
- email
- company
- phone
- preferred_date
- preferred_time
- message
- status (pending/confirmed/completed/cancelled)

### ContactInquiry
- user_id (optional)
- inquiry_type (general/partnership/product/support)
- full_name
- email
- company
- subject
- message
- status (new/in_progress/resolved)

### ProductInquiry
- user_id (optional)
- product_id
- full_name
- email
- company
- message
- status (pending/quoted/ordered/completed)

### NewsletterSubscription
- email (unique)
- subscribed_at
- unsubscribed_at
- status (active/unsubscribed)

### BlogPost
- slug (unique)
- title
- excerpt
- content
- author_id
- featured_image_url
- tags
- status (draft/published)
- published_at

## Environment Variables

See `.env.example` for all available environment variables.

### Required Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens

### Optional Variables (Phase 3)
- `EMAIL_SERVICE` - Email service provider (sendgrid/smtp)
- `EMAIL_API_KEY` - Email service API key
- `AWS_ACCESS_KEY_ID` - AWS access key for S3
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for S3
- `AWS_S3_BUCKET` - S3 bucket name

## Development

### Testing Authentication Middleware

Test routes are available for development:

```bash
# Test protected route (requires auth token)
GET /api/test/protected

# Test admin route (requires auth token + admin role)
GET /api/test/admin
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- CORS is configured to only allow requests from the frontend URL
- Input validation is performed on all endpoints
- File uploads are restricted to images only (max 5MB)

## Next Steps (Phase 3)

1. Implement authentication routes
2. Implement demo booking routes
3. Implement contact inquiry routes
4. Implement newsletter routes
5. Implement blog CMS routes
6. Configure email service
7. Configure file upload service (S3 or Cloudinary)
8. Add rate limiting
9. Add input sanitization
10. Add comprehensive error handling

## Support

For questions or issues, please contact the development team.
