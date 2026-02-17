# Privacy Policy & Terms of Service Setup

## Issue
The Privacy Policy and Terms of Service pages are showing 404 errors because the content hasn't been seeded in the database yet.

## Solution
I've added a seed endpoint to populate the database with default Privacy Policy and Terms of Service content.

## Steps to Fix

### 1. Restart the Backend Server
The backend server needs to be restarted to pick up the new `/api/content/seed` endpoint.

```bash
# Stop the current backend server (Ctrl+C in the terminal where it's running)
# Then restart it:
cd backend
npm start
```

### 2. Seed the Content
Once the backend server is running, execute one of these commands:

**Option A: Using the Node script (Recommended)**
```bash
node backend/seed-content-via-api.js
```

**Option B: Using curl/PowerShell**
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/content/seed -Method POST
```

**Option C: Using curl (if available)**
```bash
curl -X POST http://localhost:5000/api/content/seed
```

### 3. Verify
After seeding, visit these pages to confirm they're working:
- http://localhost:8081/privacy
- http://localhost:8081/terms

## What Was Added

### 1. Seed Endpoint
Added `POST /api/content/seed` endpoint in `backend/routes/content.js` that:
- Only works in development mode (not production)
- Clears existing content
- Seeds Privacy Policy with 8 sections
- Seeds Terms of Service with 10 sections

### 2. Helper Script
Created `backend/seed-content-via-api.js` - a simple Node.js script to call the seed endpoint.

### 3. Updated Seed File
Updated `backend/seeds/content.js` with:
- Correct path to backend `.env` file
- DNS fix for Windows MongoDB Atlas connection

## Content Included

### Privacy Policy Sections
1. Introduction
2. Information We Collect
3. How We Use Your Information
4. Data Sharing and Disclosure
5. Cookies and Tracking Technologies
6. Your Rights and Choices
7. Data Security
8. Contact Us

### Terms of Service Sections
1. Acceptance of Terms
2. Description of Service
3. User Accounts and Registration
4. Acceptable Use Policy
5. Intellectual Property Rights
6. Payment and Billing
7. Limitation of Liability
8. Termination
9. Governing Law and Dispute Resolution
10. Contact Information

## Troubleshooting

### If seeding fails:
1. Make sure backend server is running on port 5000
2. Check MongoDB connection in `backend/.env`
3. Verify `NODE_ENV=development` in `backend/.env`

### If pages still show 404:
1. Clear browser cache
2. Check browser console for errors
3. Verify API base URL in frontend `.env`: `VITE_API_BASE_URL=http://localhost:5000/api`

## Alternative: Manual Seeding
If the API approach doesn't work, you can seed directly using MongoDB:

```bash
cd backend
node seeds/content.js
```

Note: This requires fixing the DNS issue on Windows, which is already included in the updated seed file.
