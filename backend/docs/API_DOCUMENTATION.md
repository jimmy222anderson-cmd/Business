# Earth Observation Platform - API Documentation

## Overview

This document provides comprehensive documentation for the Earth Observation Platform backend API. The API is built with Node.js/Express and uses MongoDB for data persistence.

**Base URL**: `http://localhost:3000/api` (development)  
**Production URL**: `https://api.earthintelligence.com/api`

**Authentication**: JWT Bearer Token (where required)

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Demo Booking Endpoints](#demo-booking-endpoints)
3. [Contact Form Endpoints](#contact-form-endpoints)
4. [Quote Request Endpoints](#quote-request-endpoints)
5. [Content Management Endpoints](#content-management-endpoints)
6. [Admin Endpoints](#admin-endpoints)
7. [Error Codes](#error-codes)
8. [Rate Limiting](#rate-limiting)

---

## Authentication Endpoints

### Sign Up

Create a new user account.

**Endpoint**: `POST /api/auth/signup`  
**Authentication**: None  
**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "companyName": "Acme Corp",
  "password": "SecurePass123!"
}
```

**Request Fields**:
- `fullName` (string, required): User's full name
- `email` (string, required): Valid email address
- `companyName` (string, optional): Company name
- `password` (string, required): Minimum 8 characters, must include uppercase, lowercase, and number

**Success Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "companyName": "Acme Corp",
    "role": "user",
    "emailVerified": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input or email already exists
  ```json
  {
    "error": "Email already registered"
  }
  ```
- `422 Unprocessable Entity`: Validation errors
  ```json
  {
    "error": "Password must be at least 8 characters and include uppercase, lowercase, and number"
  }
  ```

---

### Sign In

Authenticate an existing user.

**Endpoint**: `POST /api/auth/signin`  
**Authentication**: None  
**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Request Fields**:
- `email` (string, required): User's email address
- `password` (string, required): User's password

**Success Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "companyName": "Acme Corp",
    "role": "user",
    "emailVerified": true
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "error": "Invalid credentials"
  }
  ```
- `403 Forbidden`: Email not verified
  ```json
  {
    "error": "Please verify your email before signing in"
  }
  ```

---

### Forgot Password

Request a password reset link.

**Endpoint**: `POST /api/auth/forgot-password`  
**Authentication**: None  
**Rate Limit**: 3 requests per hour

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Request Fields**:
- `email` (string, required): User's email address

**Success Response** (200 OK):
```json
{
  "message": "If an account exists with this email, a password reset link has been sent"
}
```

**Note**: For security reasons, the response does not reveal whether the email exists in the system.

---

### Reset Password

Reset password using a valid reset token.

**Endpoint**: `POST /api/auth/reset-password`  
**Authentication**: None  
**Rate Limit**: 5 requests per hour

**Request Body**:
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0",
  "newPassword": "NewSecurePass123!"
}
```

**Request Fields**:
- `token` (string, required): Password reset token from email
- `newPassword` (string, required): New password (minimum 8 characters, must include uppercase, lowercase, and number)

**Success Response** (200 OK):
```json
{
  "message": "Password has been reset successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid or expired token
  ```json
  {
    "error": "Invalid or expired reset token"
  }
  ```
- `422 Unprocessable Entity`: Password validation failed
  ```json
  {
    "error": "Password must be at least 8 characters and include uppercase, lowercase, and number"
  }
  ```

---

### Verify Email

Verify user's email address.

**Endpoint**: `GET /api/auth/verify-email/:token`  
**Authentication**: None  
**Rate Limit**: 10 requests per hour

**URL Parameters**:
- `token` (string, required): Email verification token from email

**Success Response** (200 OK):
```json
{
  "message": "Email verified successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid or expired token
  ```json
  {
    "error": "Invalid or expired verification token"
  }
  ```

---

### Get Current User

Get authenticated user's profile.

**Endpoint**: `GET /api/auth/me`  
**Authentication**: Required (JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "companyName": "Acme Corp",
  "role": "user",
  "emailVerified": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
  ```json
  {
    "error": "Unauthorized"
  }
  ```

---

### Sign Out

Sign out the current user (client-side token removal).

**Endpoint**: `POST /api/auth/signout`  
**Authentication**: Optional  
**Rate Limit**: 100 requests per hour

**Success Response** (200 OK):
```json
{
  "message": "Signed out successfully"
}
```

---

## Demo Booking Endpoints

### Create Demo Booking

Submit a demo booking request.

**Endpoint**: `POST /api/demo/book`  
**Authentication**: None  
**Rate Limit**: 10 requests per hour

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "companyName": "Acme Corp",
  "phoneNumber": "+1-555-123-4567",
  "jobTitle": "CTO",
  "message": "Interested in satellite imagery for agriculture monitoring"
}
```

**Request Fields**:
- `fullName` (string, required): Contact's full name
- `email` (string, required): Valid email address
- `companyName` (string, optional): Company name
- `phoneNumber` (string, optional): Phone number
- `jobTitle` (string, optional): Job title
- `message` (string, optional): Additional message or requirements

**Success Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "companyName": "Acme Corp",
  "phoneNumber": "+1-555-123-4567",
  "jobTitle": "CTO",
  "message": "Interested in satellite imagery for agriculture monitoring",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input
  ```json
  {
    "error": "Invalid email format"
  }
  ```
- `429 Too Many Requests`: Rate limit exceeded
  ```json
  {
    "error": "Too many requests, please try again later"
  }
  ```

---

### Get User's Demo Bookings

Get all demo bookings for the authenticated user.

**Endpoint**: `GET /api/demo/bookings/user/:userId`  
**Authentication**: Required (JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**URL Parameters**:
- `userId` (string, required): User's MongoDB ObjectId

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "companyName": "Acme Corp",
    "status": "confirmed",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User can only access their own bookings

---

## Contact Form Endpoints

### Submit Contact Inquiry

Submit a contact form inquiry.

**Endpoint**: `POST /api/contact`  
**Authentication**: None  
**Rate Limit**: 10 requests per hour

**Request Body**:
```json
{
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "subject": "Partnership Inquiry",
  "message": "We are interested in partnering with your platform for our agriculture clients."
}
```

**Request Fields**:
- `fullName` (string, required): Contact's full name
- `email` (string, required): Valid email address
- `subject` (string, required): Inquiry subject
- `message` (string, required): Inquiry message

**Success Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "subject": "Partnership Inquiry",
  "message": "We are interested in partnering with your platform for our agriculture clients.",
  "status": "new",
  "createdAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input or missing required fields
  ```json
  {
    "error": "Subject and message are required"
  }
  ```

---

### Get User's Contact Inquiries

Get all contact inquiries for the authenticated user.

**Endpoint**: `GET /api/contact/inquiries/user/:userId`  
**Authentication**: Required (JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**URL Parameters**:
- `userId` (string, required): User's MongoDB ObjectId

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "subject": "Partnership Inquiry",
    "status": "in-progress",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
]
```

---

## Quote Request Endpoints

### Submit Quote Request

Submit a custom pricing quote request.

**Endpoint**: `POST /api/quote/request`  
**Authentication**: None  
**Rate Limit**: 10 requests per hour

**Request Body**:
```json
{
  "fullName": "Bob Johnson",
  "email": "bob.johnson@example.com",
  "companyName": "Mining Corp",
  "phoneNumber": "+1-555-987-6543",
  "industry": "Mining",
  "estimatedDataVolume": "10-50 TB/month",
  "requirements": "Need high-resolution imagery for mining site monitoring across 5 locations"
}
```

**Request Fields**:
- `fullName` (string, required): Contact's full name
- `email` (string, required): Valid email address
- `companyName` (string, optional): Company name
- `phoneNumber` (string, optional): Phone number
- `industry` (string, required): Industry (Financial Services, Agriculture, Energy, Mining, Construction, Government, Environment, Insurance, Other)
- `estimatedDataVolume` (string, required): Data volume range (< 1 TB/month, 1-10 TB/month, 10-50 TB/month, 50-100 TB/month, > 100 TB/month, Not sure)
- `requirements` (string, required): Detailed requirements

**Success Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "fullName": "Bob Johnson",
  "email": "bob.johnson@example.com",
  "companyName": "Mining Corp",
  "phoneNumber": "+1-555-987-6543",
  "industry": "Mining",
  "estimatedDataVolume": "10-50 TB/month",
  "requirements": "Need high-resolution imagery for mining site monitoring across 5 locations",
  "status": "pending",
  "createdAt": "2024-01-15T12:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input or missing required fields
  ```json
  {
    "error": "Industry and requirements are required"
  }
  ```

---

### Get User's Quote Requests

Get all quote requests for the authenticated user.

**Endpoint**: `GET /api/quote/requests/user/:userId`  
**Authentication**: Required (JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**URL Parameters**:
- `userId` (string, required): User's MongoDB ObjectId

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "fullName": "Bob Johnson",
    "email": "bob.johnson@example.com",
    "companyName": "Mining Corp",
    "industry": "Mining",
    "status": "quoted",
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
]
```

---

## Content Management Endpoints

### Get Privacy Policy

Get the current privacy policy content.

**Endpoint**: `GET /api/content/privacy`  
**Authentication**: None  
**Rate Limit**: 100 requests per hour

**Success Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "type": "privacy-policy",
  "sections": [
    {
      "id": "introduction",
      "title": "Introduction",
      "content": "This Privacy Policy describes how we collect, use, and protect your personal information..."
    },
    {
      "id": "data-collection",
      "title": "Data Collection",
      "content": "We collect information that you provide directly to us..."
    }
  ],
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "version": "1.0"
}
```

---

### Get Terms of Service

Get the current terms of service content.

**Endpoint**: `GET /api/content/terms`  
**Authentication**: None  
**Rate Limit**: 100 requests per hour

**Success Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "type": "terms-of-service",
  "sections": [
    {
      "id": "acceptance",
      "title": "Acceptance of Terms",
      "content": "By accessing and using this service, you accept and agree to be bound by the terms..."
    }
  ],
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "version": "1.0"
}
```

---

## Admin Endpoints

All admin endpoints require authentication with an admin role.

### Get All Demo Bookings (Admin)

Get all demo bookings with filtering options.

**Endpoint**: `GET /api/admin/demo/bookings`  
**Authentication**: Required (Admin JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**Query Parameters**:
- `status` (string, optional): Filter by status (pending, confirmed, completed, cancelled)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):
```json
{
  "bookings": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "companyName": "Acme Corp",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 3
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User is not an admin
  ```json
  {
    "error": "Forbidden"
  }
  ```

---

### Update Demo Booking Status (Admin)

Update the status of a demo booking.

**Endpoint**: `PUT /api/admin/demo/bookings/:id/status`  
**Authentication**: Required (Admin JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**URL Parameters**:
- `id` (string, required): Booking MongoDB ObjectId

**Request Body**:
```json
{
  "status": "confirmed"
}
```

**Request Fields**:
- `status` (string, required): New status (pending, confirmed, completed, cancelled)

**Success Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "status": "confirmed",
  "updatedAt": "2024-01-15T14:00:00.000Z"
}
```

---

### Get All Contact Inquiries (Admin)

Get all contact inquiries with filtering options.

**Endpoint**: `GET /api/admin/contact/inquiries`  
**Authentication**: Required (Admin JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**Query Parameters**:
- `status` (string, optional): Filter by status (new, in-progress, resolved, closed)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Success Response** (200 OK):
```json
{
  "inquiries": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com",
      "subject": "Partnership Inquiry",
      "status": "new",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "total": 32,
  "page": 1,
  "pages": 2
}
```

---

### Update Contact Inquiry Status (Admin)

Update the status of a contact inquiry.

**Endpoint**: `PUT /api/admin/contact/inquiries/:id/status`  
**Authentication**: Required (Admin JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**URL Parameters**:
- `id` (string, required): Inquiry MongoDB ObjectId

**Request Body**:
```json
{
  "status": "in-progress"
}
```

**Request Fields**:
- `status` (string, required): New status (new, in-progress, resolved, closed)

**Success Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "subject": "Partnership Inquiry",
  "status": "in-progress",
  "updatedAt": "2024-01-15T15:00:00.000Z"
}
```

---

### Get All Quote Requests (Admin)

Get all quote requests with filtering options.

**Endpoint**: `GET /api/admin/quote/requests`  
**Authentication**: Required (Admin JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**Query Parameters**:
- `status` (string, optional): Filter by status (pending, quoted, accepted, declined)
- `industry` (string, optional): Filter by industry
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Success Response** (200 OK):
```json
{
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "fullName": "Bob Johnson",
      "email": "bob.johnson@example.com",
      "companyName": "Mining Corp",
      "industry": "Mining",
      "status": "pending",
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "total": 28,
  "page": 1,
  "pages": 2
}
```

---

### Update Quote Request Status (Admin)

Update the status of a quote request.

**Endpoint**: `PUT /api/admin/quote/requests/:id/status`  
**Authentication**: Required (Admin JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**URL Parameters**:
- `id` (string, required): Quote request MongoDB ObjectId

**Request Body**:
```json
{
  "status": "quoted"
}
```

**Request Fields**:
- `status` (string, required): New status (pending, quoted, accepted, declined)

**Success Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "fullName": "Bob Johnson",
  "email": "bob.johnson@example.com",
  "status": "quoted",
  "updatedAt": "2024-01-15T16:00:00.000Z"
}
```

---

### Add Quote Details (Admin)

Add pricing and quote details to a quote request.

**Endpoint**: `PUT /api/admin/quote/requests/:id/quote`  
**Authentication**: Required (Admin JWT Bearer Token)  
**Rate Limit**: 100 requests per hour

**URL Parameters**:
- `id` (string, required): Quote request MongoDB ObjectId

**Request Body**:
```json
{
  "quoteDetails": {
    "pricing": "$5,000/month",
    "terms": "12-month contract, monthly billing",
    "validUntil": "2024-02-15T00:00:00.000Z",
    "notes": "Includes 50 TB/month of high-resolution imagery"
  }
}
```

**Success Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "fullName": "Bob Johnson",
  "email": "bob.johnson@example.com",
  "status": "quoted",
  "quoteDetails": {
    "pricing": "$5,000/month",
    "terms": "12-month contract, monthly billing",
    "validUntil": "2024-02-15T00:00:00.000Z",
    "notes": "Includes 50 TB/month of high-resolution imagery"
  },
  "updatedAt": "2024-01-15T16:30:00.000Z"
}
```

---

### Update Content (Admin)

Update privacy policy or terms of service content.

**Endpoint**: `PUT /api/admin/content/:type`  
**Authentication**: Required (Admin JWT Bearer Token)  
**Rate Limit**: 50 requests per hour

**URL Parameters**:
- `type` (string, required): Content type (privacy-policy, terms-of-service)

**Request Body**:
```json
{
  "sections": [
    {
      "id": "introduction",
      "title": "Introduction",
      "content": "Updated privacy policy content..."
    }
  ],
  "version": "1.1"
}
```

**Success Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "type": "privacy-policy",
  "sections": [...],
  "lastUpdated": "2024-01-15T17:00:00.000Z",
  "version": "1.1"
}
```

---

## Error Codes

The API uses standard HTTP status codes:

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or malformed request |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation errors |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

For validation errors with multiple fields:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Rate Limiting

Rate limits are applied per IP address:

| Endpoint Category | Rate Limit |
|-------------------|------------|
| Authentication (signup, signin) | 5 requests per 15 minutes |
| Password reset | 3 requests per hour |
| Form submissions (demo, contact, quote) | 10 requests per hour |
| Content retrieval | 100 requests per hour |
| Admin operations | 100 requests per hour |

When rate limit is exceeded, the API returns:

**Status**: 429 Too Many Requests

```json
{
  "error": "Too many requests, please try again later",
  "retryAfter": 900
}
```

The `retryAfter` field indicates seconds until the rate limit resets.

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire after 7 days. Obtain a new token by signing in again.

---

## Postman Collection

A Postman collection with all endpoints and example requests is available at:
`backend/docs/Earth_Intelligence_Platform.postman_collection.json`

Import this collection into Postman for easy API testing.

---

## Support

For API support or questions, contact:
- Email: api-support@earthintelligence.com
- Documentation: https://docs.earthintelligence.com
