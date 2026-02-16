# Quick Start Guide - Content Management System

## Prerequisites
- Node.js installed
- MongoDB running (local or Atlas)
- Admin user created (or will be created by migration script)

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
npm install
```

## Step 2: Configure Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Step 3: Run Data Migration

This will populate your database with initial content:

```bash
cd backend
node scripts/migrate-content.js
```

Expected output:
```
Connected to MongoDB

Clearing existing data...
Existing data cleared

Migrating products...
✓ Migrated 3 products

Migrating industries...
✓ Migrated 2 industries

Migrating partners...
✓ Migrated 5 partners

Migrating blog posts...
✓ Migrated 2 blog posts

✅ Migration completed successfully!

Summary:
- Products: 3
- Industries: 2
- Partners: 5
- Blog Posts: 2

Database connection closed
```

## Step 4: Start Backend Server

```bash
cd backend
npm start
```

Server should start on http://localhost:3000

## Step 5: Start Frontend Development Server

```bash
npm run dev
```

Frontend should start on http://localhost:5173

## Step 6: Access the Application

### Public Pages
- Homepage: http://localhost:5173
- Products: http://localhost:5173/products
- Industries: http://localhost:5173/industries
- Blog: http://localhost:5173/blog

### Admin Panel
1. Login: http://localhost:5173/auth/signin
2. Use admin credentials (created during migration or existing admin)
3. Dashboard: http://localhost:5173/admin/dashboard

### Admin Content Management
- Products: http://localhost:5173/admin/products
- Industries: http://localhost:5173/admin/industries
- Partners: http://localhost:5173/admin/partners
- Blog: http://localhost:5173/admin/blog

## Step 7: Test the CMS

### Create a New Product
1. Go to http://localhost:5173/admin/products
2. Click "Add Product"
3. Fill in the form:
   - Name: "Test Product"
   - Description: "This is a test product"
   - Category: Select one
   - Upload an image
   - Add features, use cases, specifications
4. Click "Create Product"
5. Verify it appears in the products list
6. Check frontend: http://localhost:5173/products

### Edit a Product
1. Click the Edit button on any product
2. Modify fields
3. Click "Update Product"
4. Verify changes

### Delete a Product
1. Click the Delete button
2. Confirm deletion
3. Verify it's removed

### Repeat for Industries, Partners, and Blog Posts

## Troubleshooting

### Migration Script Fails
- Check MongoDB connection string
- Ensure MongoDB is running
- Check for existing data conflicts

### Backend Won't Start
- Check if port 3000 is available
- Verify environment variables
- Check MongoDB connection

### Frontend Won't Start
- Check if port 5173 is available
- Verify VITE_API_BASE_URL is set
- Clear node_modules and reinstall

### Can't Login to Admin
- Ensure admin user exists in database
- Check JWT_SECRET is set
- Verify credentials

### Images Won't Upload
- Check upload directory permissions
- Verify /api/upload endpoint is working
- Check file size (max 5MB)

### Data Not Showing on Frontend
- Check browser console for errors
- Verify API endpoints are accessible
- Check CORS configuration
- Ensure data status is "active" or "published"

## API Testing

### Test Public Endpoints (No Auth Required)
```bash
# Get all products
curl http://localhost:3000/api/public/products

# Get all industries
curl http://localhost:3000/api/public/industries

# Get all partners
curl http://localhost:3000/api/public/partners

# Get all blog posts
curl http://localhost:3000/api/public/blog
```

### Test Admin Endpoints (Auth Required)
```bash
# Login first to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'

# Use the token in subsequent requests
curl http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

1. **Customize Content**: Add your own products, industries, partners, and blog posts
2. **Update Images**: Replace placeholder images with real ones
3. **Configure SEO**: Add meta descriptions and keywords
4. **Test Thoroughly**: Test all CRUD operations
5. **Deploy**: Follow deployment guide for production

## Common Tasks

### Add a New Admin User
```javascript
// In MongoDB shell or Compass
db.userprofiles.insertOne({
  email: "newadmin@example.com",
  password_hash: "hashed_password", // Use proper hashing
  full_name: "New Admin",
  role: "admin",
  email_verified: true,
  created_at: new Date(),
  updated_at: new Date()
})
```

### Reset Database
```bash
cd backend
node scripts/migrate-content.js
```
This will clear and re-populate the database.

### Check Database Content
```javascript
// In MongoDB shell
use your_database_name

// Count documents
db.products.countDocuments()
db.industries.countDocuments()
db.partners.countDocuments()
db.blogposts.countDocuments()

// View all products
db.products.find().pretty()
```

## Support

If you encounter issues:
1. Check the console logs (browser and terminal)
2. Review the error messages
3. Verify environment variables
4. Check database connection
5. Ensure all dependencies are installed

## Success Indicators

✅ Migration script completes without errors
✅ Backend server starts successfully
✅ Frontend loads without errors
✅ Can login to admin panel
✅ Can view products/industries/blog on frontend
✅ Can create/edit/delete content in admin panel
✅ Images upload successfully
✅ Changes reflect on frontend immediately

Congratulations! Your CMS is now fully operational! 🎉
