# Security and Validation Implementation

## Overview
This document describes the security and validation features implemented for the Earth Observation Platform backend API.

## Implemented Features

### 1. Rate Limiting (Task 39.1)

**Implementation:**
- Installed `express-rate-limit` package
- Created `backend/middleware/rateLimiter.js` with three rate limiters:
  - **Auth Limiter**: 5 requests per 15 minutes for authentication endpoints
  - **Form Limiter**: 10 requests per hour for form submission endpoints
  - **API Limiter**: 100 requests per 15 minutes for general API endpoints

**Applied to:**
- Auth endpoints: `/api/auth/signup`, `/api/auth/signin`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- Form endpoints: `/api/demo/book`, `/api/contact`, `/api/quote/request`
- All API routes: `/api/*`

**Response:**
- Returns HTTP 429 (Too Many Requests) when limit is exceeded
- Includes `RateLimit-*` headers in responses

### 2. Input Sanitization (Task 39.2)

**Implementation:**
- Installed `express-validator` package
- Created `backend/middleware/validation.js` with validation rules for:
  - User signup (email, password strength, name, company)
  - User signin (email, password)
  - Forgot password (email)
  - Reset password (token, new password)
  - Demo booking (name, email, phone, company, job title, message)
  - Contact inquiry (name, email, company, subject, message)
  - Quote request (name, email, company, phone, industry, data volume, requirements)

**Security Features:**
- Email validation and normalization
- HTML escaping to prevent XSS attacks
- Input trimming and length validation
- Phone number format validation
- Industry and data volume enum validation
- MongoDB injection prevention through input sanitization

### 3. CORS Configuration (Task 39.3)

**Implementation:**
- Enhanced CORS configuration in `backend/server.js`
- Whitelist-based origin validation
- Configurable allowed origins via environment variables

**Configuration:**
- **Allowed Origins**: Frontend URL from environment variable + localhost development URLs
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With, Accept, Origin
- **Credentials**: Enabled for cookie-based authentication
- **Max Age**: 600 seconds (10 minutes)

### 4. Security Headers (Task 39.4)

**Implementation:**
- Installed `helmet` package
- Configured comprehensive security headers in `backend/server.js`

**Headers Configured:**
- **Content Security Policy (CSP)**: Restricts resource loading to prevent XSS
- **HTTP Strict Transport Security (HSTS)**: Forces HTTPS connections (1 year max-age)
- **Referrer Policy**: `strict-origin-when-cross-origin`
- **X-Content-Type-Options**: `nosniff` to prevent MIME type sniffing
- **X-XSS-Protection**: Enabled XSS filter
- **X-Powered-By**: Hidden to prevent server fingerprinting

### 5. Password Security (Task 39.5)

**Implementation:**
- Created `backend/utils/passwordSecurity.js` with comprehensive password utilities
- Updated `backend/models/UserProfile.js` to include password history
- Enhanced authentication routes to use secure password handling

**Features:**

#### Password Strength Requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Optional special character requirement (configurable)

#### Password Hashing:
- Uses bcrypt with 10 salt rounds
- Secure password comparison
- Never logs or exposes passwords in plain text

#### Password History:
- Stores last 5 password hashes
- Prevents password reuse
- Automatically updated on password changes

#### Password Utilities:
- `validatePasswordStrength()`: Validates password against security requirements
- `hashPassword()`: Securely hashes passwords with bcrypt
- `comparePassword()`: Safely compares passwords with hashes
- `isPasswordReused()`: Checks if password was used recently
- `updatePasswordHistory()`: Maintains password history
- `sanitizePasswordFromLogs()`: Removes passwords from log output

## Environment Variables

Add these to your `.env` file:

```env
# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# JWT Secret for authentication
JWT_SECRET=your-secret-key-here

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/earth-intelligence

# Email Configuration
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@earthintelligence.com
SALES_EMAIL=sales@earthintelligence.com

# Server Configuration
NODE_ENV=development
PORT=3000
```

## Testing

### Rate Limiting Test:
```bash
# Test auth rate limiting (should fail after 5 requests)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123"}'
done
```

### Input Validation Test:
```bash
# Test invalid email
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"Test123"}'

# Test weak password
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak"}'
```

### CORS Test:
```bash
# Test CORS from unauthorized origin (should fail)
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Origin: http://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'
```

### Security Headers Test:
```bash
# Check security headers
curl -I http://localhost:3000/api/health
```

### Password Security Test:
```bash
# Test password reuse prevention
# 1. Create account with password "Test123456"
# 2. Reset password to "NewPass123"
# 3. Try to reset password back to "Test123456" (should fail)
```

## Security Best Practices

1. **Never log passwords**: All password logging is sanitized
2. **Use HTTPS in production**: HSTS header enforces this
3. **Rotate JWT secrets regularly**: Update JWT_SECRET periodically
4. **Monitor rate limit violations**: Log and alert on excessive rate limiting
5. **Keep dependencies updated**: Regularly update security packages
6. **Use strong JWT secrets**: Minimum 32 characters, random
7. **Enable MongoDB authentication**: Never use MongoDB without authentication in production
8. **Implement API key rotation**: For email and other third-party services
9. **Regular security audits**: Run `npm audit` regularly
10. **Input validation on frontend**: Client-side validation as first line of defense

## Compliance

This implementation helps meet the following security standards:
- OWASP Top 10 protection
- PCI DSS password requirements
- GDPR data protection requirements
- SOC 2 security controls

## Future Enhancements

Consider implementing:
- Two-factor authentication (2FA)
- Account lockout after failed login attempts
- IP-based blocking for suspicious activity
- Security event logging and monitoring
- API key authentication for third-party integrations
- OAuth 2.0 integration (Google, Microsoft)
- Session management and token refresh
- Audit logging for sensitive operations
