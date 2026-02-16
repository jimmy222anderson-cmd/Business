# MongoDB Connection Issue - Resolution Guide

## Current Situation

✅ **MongoDB Compass Connected**: You can connect to MongoDB Atlas using Compass  
❌ **Backend Application Cannot Connect**: IP whitelist restriction

## The Problem

MongoDB Atlas has IP whitelist security that blocks connections from unauthorized IP addresses. Your Compass connection works because it was authorized, but when the backend application tries to connect, it's being blocked.

## Error Message
```
Error connecting to MongoDB: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solutions

### Solution 1: Add Your IP to MongoDB Atlas Whitelist (Recommended for Development)

1. Go to MongoDB Atlas (https://cloud.mongodb.com/)
2. Sign in to your account
3. Select your cluster (cluster0.7k176ua.mongodb.net)
4. Click on "Network Access" in the left sidebar
5. Click "Add IP Address"
6. Click "Add Current IP Address" (this will add your current IP)
7. Click "Confirm"
8. Wait 1-2 minutes for the change to propagate

### Solution 2: Allow Access from Anywhere (Development Only - NOT for Production)

1. Go to MongoDB Atlas
2. Click on "Network Access"
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

⚠️ **Warning**: This allows connections from any IP address. Only use this for development/testing.

### Solution 3: Use the Correct Database Name

Your current connection string uses different databases:
- Compass: `admin` database (read-only access)
- Backend: Needs a database with read/write access

**Current .env**:
```
MONGODB_URI=mongodb+srv://davidjohn91a_db_user:VU1O4ALRjWHXK20A@cluster0.7k176ua.mongodb.net/earth-intelligence?retryWrites=true&w=majority
```

**Options**:
1. Use `admin` database if you have write permissions
2. Create a new database called `earth-intelligence`
3. Use an existing database you have access to

### Solution 4: Check User Permissions

Your MongoDB user (`davidjohn91a_db_user`) needs:
- Read and write permissions on the database
- Permission to create collections
- Permission to create indexes

To check/update permissions:
1. Go to MongoDB Atlas
2. Click on "Database Access" in the left sidebar
3. Find user `davidjohn91a_db_user`
4. Click "Edit"
5. Ensure role is "Atlas admin" or "Read and write to any database"
6. Click "Update User"

## Testing the Connection

### Option 1: Test with Compass Connection String

1. In MongoDB Compass, click on your connection
2. Click "Edit Connection"
3. Copy the full connection string
4. Replace the `MONGODB_URI` in `backend/.env` with this string
5. Make sure to include the database name at the end

Example:
```
MONGODB_URI=mongodb+srv://davidjohn91a_db_user:VU1O4ALRjWHXK20A@cluster0.7k176ua.mongodb.net/YOUR_DATABASE_NAME?retryWrites=true&w=majority
```

### Option 2: Test Connection with Node.js Script

Create a test file `test-connection.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // Try to create a test collection
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'data', timestamp: new Date() });
    console.log('✓ Write permission confirmed');
    
    await testCollection.deleteOne({ test: 'data' });
    console.log('✓ Delete permission confirmed');
    
    await mongoose.connection.close();
    console.log('✓ Connection closed');
    
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

Run: `node test-connection.js`

## Recommended Steps

1. **Add your IP to whitelist** (Solution 1) - This is the most secure option
2. **Wait 1-2 minutes** for changes to propagate
3. **Restart the backend server**
4. **Run the quick test**: `node scripts/quick-test.js`

## Current Connection Details

- **Cluster**: cluster0.7k176ua.mongodb.net
- **User**: davidjohn91a_db_user
- **Database**: earth-intelligence (or admin)
- **Connection Type**: MongoDB Atlas (cloud)

## Verification Checklist

After making changes:
- [ ] IP address added to whitelist
- [ ] User has read/write permissions
- [ ] Database name is correct
- [ ] Connection string includes database name
- [ ] Backend server restarted
- [ ] Test connection successful

## Need Help?

If you're still having issues:
1. Check MongoDB Atlas dashboard for any alerts
2. Verify your IP address hasn't changed
3. Try the "Allow Access from Anywhere" option temporarily
4. Check if there are any billing/quota issues with your Atlas account

## Next Steps After Connection Works

Once MongoDB is connected:
1. Run `node scripts/test-endpoints.js` for comprehensive testing
2. Seed initial data: `npm run seed:content`
3. Test all authentication flows
4. Test all form submissions
5. Verify admin dashboard functionality

---

*Last Updated: February 13, 2026*
