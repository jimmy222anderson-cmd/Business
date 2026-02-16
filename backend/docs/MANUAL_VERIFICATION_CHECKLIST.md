# Manual Verification Checklist - Task 42

## Prerequisites
- [ ] MongoDB connection established
- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173 (for CORS testing)
- [ ] Email service configured (optional for email testing)

---

## 1. Server Health Check

### Test 1.1: Server is Running
```bash
curl http://localhost:3000/api/health
```
**Expected**: `{"status":"ok","message":"Earth Intelligence Platform API is running"}`

---

## 2. Authentication Flow Testing

### Test 2.1: Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "companyName": "Test Company",
    "password": "TestPass123!"
  }'
```
**Expected**: 
- Status: 201
- Response contains: `token`, `user` object
- User object has: `_id`, `email`, `fullName`, `role`
- Password NOT in response

**Verify in MongoDB**:
- User document created
- Password is hashed (starts with `$2b$`)
- emailVerificationToken exists
- emailVerified is false

### Test 2.2: Sign In
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```
**Expected**:
- Status: 200
- Response contains: `token`, `user` object

### Test 2.3: Get Current User
```bash
# Replace YOUR_TOKEN with token from sign in
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**:
- Status: 200
- Response contains user data (no password)

### Test 2.4: Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```
**Expected**:
- Status: 200
- Success message returned

**Verify in MongoDB**:
- User has passwordResetToken
- passwordResetExpires is set (1 hour from now)

**Verify Email** (if configured):
- Password reset email sent to user

### Test 2.5: Invalid Credentials
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }'
```
**Expected**:
- Status: 401
- Error message: "Invalid credentials"

### Test 2.6: Duplicate Email
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Another User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```
**Expected**:
- Status: 400
- Error message: "Email already registered"

---

## 3. Demo Booking Testing

### Test 3.1: Book Demo
```bash
curl -X POST http://localhost:3000/api/demo/book \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Demo User",
    "email": "demo@example.com",
    "companyName": "Demo Company",
    "phoneNumber": "+1234567890",
    "jobTitle": "Manager",
    "message": "I would like to book a demo"
  }'
```
**Expected**:
- Status: 201
- Response contains: `_id`, booking details
- Status is "pending"

**Verify in MongoDB**:
- DemoBooking document created
- All fields saved correctly
- createdAt timestamp exists

**Verify Email** (if configured):
- Confirmation email sent to user
- Notification email sent to sales team

### Test 3.2: Invalid Demo Booking
```bash
curl -X POST http://localhost:3000/api/demo/book \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Demo User",
    "email": "invalid-email"
  }'
```
**Expected**:
- Status: 400
- Validation errors for missing/invalid fields

---

## 4. Contact Form Testing

### Test 4.1: Submit Contact Form
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Contact User",
    "email": "contact@example.com",
    "subject": "Test Inquiry",
    "message": "This is a test contact inquiry"
  }'
```
**Expected**:
- Status: 201
- Response contains: `_id`, inquiry details
- Status is "new"

**Verify in MongoDB**:
- ContactInquiry document created
- All fields saved correctly

**Verify Email** (if configured):
- Confirmation email sent to user
- Notification email sent to support team

### Test 4.2: Invalid Contact Form
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contact@example.com"
  }'
```
**Expected**:
- Status: 400
- Validation errors for missing required fields

---

## 5. Quote Request Testing

### Test 5.1: Submit Quote Request
```bash
curl -X POST http://localhost:3000/api/quote/request \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Quote User",
    "email": "quote@example.com",
    "companyName": "Quote Company",
    "phoneNumber": "+1234567890",
    "industry": "Financial Services",
    "estimatedDataVolume": "1-10 TB/month",
    "requirements": "Need satellite imagery for financial analysis"
  }'
```
**Expected**:
- Status: 201
- Response contains: `_id`, quote request details
- Status is "pending"

**Verify in MongoDB**:
- QuoteRequest document created
- All fields saved correctly

**Verify Email** (if configured):
- Confirmation email sent to user
- Notification email sent to sales team

---

## 6. Newsletter Subscription Testing

### Test 6.1: Subscribe to Newsletter
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newsletter@example.com"
  }'
```
**Expected**:
- Status: 201
- Response contains subscription details
- Status is "active"

**Verify in MongoDB**:
- NewsletterSubscription document created
- Email saved correctly

### Test 6.2: Duplicate Subscription
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newsletter@example.com"
  }'
```
**Expected**:
- Status: 200
- Message: "Already subscribed"
- No error thrown

---

## 7. Content Endpoints Testing

### Test 7.1: Get Privacy Policy
```bash
curl http://localhost:3000/api/content/privacy
```
**Expected**:
- Status: 200
- Response contains: `type`, `sections`, `lastUpdated`

### Test 7.2: Get Terms of Service
```bash
curl http://localhost:3000/api/content/terms
```
**Expected**:
- Status: 200
- Response contains: `type`, `sections`, `lastUpdated`

---

## 8. Admin Endpoints Testing

### Test 8.1: Admin Access Without Token
```bash
curl http://localhost:3000/api/admin/demo/bookings
```
**Expected**:
- Status: 401
- Error: "Unauthorized"

### Test 8.2: Admin Access With User Token
```bash
# Use token from regular user (not admin)
curl http://localhost:3000/api/admin/demo/bookings \
  -H "Authorization: Bearer USER_TOKEN"
```
**Expected**:
- Status: 403
- Error: "Forbidden"

### Test 8.3: Create Admin User
```bash
# First, manually update a user in MongoDB to have role: "admin"
# Then sign in as that user to get admin token
```

### Test 8.4: Get All Demo Bookings (Admin)
```bash
curl http://localhost:3000/api/admin/demo/bookings \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Expected**:
- Status: 200
- Array of all demo bookings

### Test 8.5: Update Demo Booking Status (Admin)
```bash
curl -X PUT http://localhost:3000/api/admin/demo/bookings/BOOKING_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```
**Expected**:
- Status: 200
- Updated booking returned

**Verify in MongoDB**:
- Booking status updated to "confirmed"

### Test 8.6: Get All Contact Inquiries (Admin)
```bash
curl http://localhost:3000/api/admin/contact/inquiries \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Expected**:
- Status: 200
- Array of all contact inquiries

### Test 8.7: Get All Quote Requests (Admin)
```bash
curl http://localhost:3000/api/admin/quote/requests \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Expected**:
- Status: 200
- Array of all quote requests

---

## 9. Security Testing

### Test 9.1: Rate Limiting on Auth Endpoints
```bash
# Run this command 6 times quickly
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
  echo "\nRequest $i"
done
```
**Expected**:
- First 5 requests: 401 (invalid credentials)
- 6th request: 429 (Too Many Requests)
- Response: "Too many requests, please try again later"

### Test 9.2: Rate Limiting on Form Endpoints
```bash
# Run this command 11 times quickly
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"fullName":"Test","email":"test@test.com","subject":"Test","message":"Test"}'
  echo "\nRequest $i"
done
```
**Expected**:
- First 10 requests: 201 or 400
- 11th request: 429 (Too Many Requests)

### Test 9.3: XSS Prevention
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "<script>alert(\"XSS\")</script>",
    "email": "test@test.com",
    "subject": "Test",
    "message": "Test"
  }'
```
**Expected**:
- Status: 201 or 400
- Script tags sanitized in database

**Verify in MongoDB**:
- fullName does not contain `<script>` tags
- Input is sanitized

### Test 9.4: SQL Injection Prevention (MongoDB)
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$ne": null},
    "password": {"$ne": null}
  }'
```
**Expected**:
- Status: 400 or 401
- Attack prevented
- No unauthorized access

### Test 9.5: CORS Headers
```bash
curl -I http://localhost:3000/api/health \
  -H "Origin: http://localhost:5173"
```
**Expected**:
- Header: `Access-Control-Allow-Origin: http://localhost:5173`
- Header: `Access-Control-Allow-Credentials: true`

### Test 9.6: Security Headers
```bash
curl -I http://localhost:3000/api/health
```
**Expected Headers**:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` or `SAMEORIGIN`
- `Content-Security-Policy: ...`
- No `X-Powered-By` header

### Test 9.7: Password Strength Validation
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "weak@example.com",
    "password": "weak"
  }'
```
**Expected**:
- Status: 400
- Error: Password does not meet requirements

---

## 10. Email Verification (If Email Service Configured)

### Test 10.1: Welcome Email
- [ ] Sign up new user
- [ ] Check email inbox
- [ ] Verify welcome email received
- [ ] Verify email contains verification link

### Test 10.2: Email Verification Link
- [ ] Click verification link from email
- [ ] Verify redirects to success page
- [ ] Check MongoDB: emailVerified is true

### Test 10.3: Password Reset Email
- [ ] Request password reset
- [ ] Check email inbox
- [ ] Verify reset email received
- [ ] Verify email contains reset link

### Test 10.4: Demo Booking Emails
- [ ] Submit demo booking
- [ ] Check user email: confirmation received
- [ ] Check sales team email: notification received

### Test 10.5: Contact Form Emails
- [ ] Submit contact form
- [ ] Check user email: confirmation received
- [ ] Check support team email: notification received

### Test 10.6: Quote Request Emails
- [ ] Submit quote request
- [ ] Check user email: confirmation received
- [ ] Check sales team email: notification received

---

## 11. Frontend Integration Testing

### Test 11.1: Sign Up Page
- [ ] Navigate to /auth/signup
- [ ] Fill in all fields
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify redirect to dashboard or email verification page

### Test 11.2: Sign In Page
- [ ] Navigate to /auth/signin
- [ ] Enter credentials
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify redirect to dashboard

### Test 11.3: Forgot Password Page
- [ ] Navigate to /auth/forgot-password
- [ ] Enter email
- [ ] Submit form
- [ ] Verify success message displayed

### Test 11.4: Book Demo Page
- [ ] Navigate to /demo
- [ ] Fill in all fields
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify form clears

### Test 11.5: Contact Page
- [ ] Navigate to /contact
- [ ] Fill in all fields
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify form clears

### Test 11.6: Request Quote Page
- [ ] Navigate to /quote
- [ ] Fill in all fields
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify form clears

### Test 11.7: Newsletter Subscription
- [ ] Navigate to footer
- [ ] Enter email in newsletter form
- [ ] Submit form
- [ ] Verify success message

---

## 12. Error Handling Testing

### Test 12.1: Network Error
- [ ] Stop backend server
- [ ] Try to submit any form
- [ ] Verify user-friendly error message displayed

### Test 12.2: Validation Errors
- [ ] Submit form with invalid email
- [ ] Verify inline error message
- [ ] Submit form with missing required fields
- [ ] Verify field-specific error messages

### Test 12.3: Server Error
- [ ] Trigger a server error (e.g., invalid MongoDB query)
- [ ] Verify 500 error handled gracefully
- [ ] Verify user-friendly error message displayed

---

## 13. Performance Testing

### Test 13.1: Response Times
- [ ] Measure response time for auth endpoints (< 500ms)
- [ ] Measure response time for form submissions (< 1000ms)
- [ ] Measure response time for content endpoints (< 200ms)

### Test 13.2: Concurrent Requests
- [ ] Send 10 concurrent requests to same endpoint
- [ ] Verify all requests handled correctly
- [ ] Verify no race conditions

---

## 14. Data Integrity Testing

### Test 14.1: User Data
- [ ] Create user
- [ ] Verify all fields saved correctly in MongoDB
- [ ] Verify password is hashed
- [ ] Verify timestamps are correct

### Test 14.2: Form Submissions
- [ ] Submit each form type
- [ ] Verify all fields saved correctly in MongoDB
- [ ] Verify status fields set correctly
- [ ] Verify timestamps are correct

### Test 14.3: Data Relationships
- [ ] Create user and submit forms
- [ ] Verify user_id references are correct
- [ ] Verify data can be queried by user

---

## Summary Checklist

### Critical Tests (Must Pass)
- [ ] Server health check
- [ ] Sign up flow
- [ ] Sign in flow
- [ ] Demo booking submission
- [ ] Contact form submission
- [ ] Quote request submission
- [ ] Rate limiting works
- [ ] Input validation works
- [ ] CORS configured correctly
- [ ] Security headers present

### Important Tests (Should Pass)
- [ ] Forgot password flow
- [ ] Email verification
- [ ] Newsletter subscription
- [ ] Admin authentication
- [ ] Admin endpoints
- [ ] XSS prevention
- [ ] MongoDB injection prevention
- [ ] Password strength validation

### Optional Tests (Nice to Have)
- [ ] Email delivery
- [ ] Performance benchmarks
- [ ] Concurrent request handling
- [ ] Frontend integration

---

## Sign-off

**Tester Name**: ___________________________

**Date**: ___________________________

**MongoDB Connected**: [ ] Yes [ ] No

**Email Service Configured**: [ ] Yes [ ] No

**All Critical Tests Passed**: [ ] Yes [ ] No

**All Important Tests Passed**: [ ] Yes [ ] No

**Ready for Production**: [ ] Yes [ ] No

**Notes**:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

