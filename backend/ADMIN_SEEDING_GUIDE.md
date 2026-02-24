# Admin User Seeding Guide

## Overview

This guide explains how to seed 3 default admin users into your MongoDB database.

## Default Admin Users

The seed script creates 3 admin users with the following credentials:

### Admin 1 - System Administrator
- **Email**: `admin@earthintelligence.com`
- **Password**: `Admin@123456`
- **Name**: System Administrator
- **Company**: Earth Observation
- **Role**: admin
- **Email Verified**: Yes

### Admin 2 - James Anderson
- **Email**: `james.admin@earthintelligence.com`
- **Password**: `James@123456`
- **Name**: James Anderson
- **Company**: Earth Observation
- **Role**: admin
- **Email Verified**: Yes

### Admin 3 - Sarah Mitchell
- **Email**: `sarah.admin@earthintelligence.com`
- **Password**: `Sarah@123456`
- **Name**: Sarah Mitchell
- **Company**: Earth Observation
- **Role**: admin
- **Email Verified**: Yes

## How to Run the Seed Script

### Method 1: Using npm script (Recommended)

```bash
cd backend
npm run seed:admins
```

### Method 2: Direct execution

```bash
cd backend
node seeds/adminUsers.js
```

## What the Script Does

1. **Connects to MongoDB** using your `MONGODB_URI` from `.env`
2. **Checks for existing users** with the same email addresses
3. **Creates new admin users** if they don't exist
4. **Updates existing users** to admin role if they exist but aren't admins
5. **Displays summary** of created, skipped, and error counts
6. **Shows credentials** for all created admin users

## Expected Output

```
🌱 Starting admin user seeding...

📡 Connecting to MongoDB...
✅ Connected to MongoDB

✅ Created: admin@earthintelligence.com
   ↳ Name: System Administrator
   ↳ Password: Admin@123456
   ↳ Role: admin

✅ Created: james.admin@earthintelligence.com
   ↳ Name: James Anderson
   ↳ Password: James@123456
   ↳ Role: admin

✅ Created: sarah.admin@earthintelligence.com
   ↳ Name: Sarah Mitchell
   ↳ Password: Sarah@123456
   ↳ Role: admin

📊 Seeding Summary:
   ✅ Created: 3
   ⏭️  Skipped: 0
   ❌ Errors: 0

🔐 Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email: admin@earthintelligence.com
🔑 Password: Admin@123456
👤 Name: System Administrator

📧 Email: james.admin@earthintelligence.com
🔑 Password: James@123456
👤 Name: James Anderson

📧 Email: sarah.admin@earthintelligence.com
🔑 Password: Sarah@123456
👤 Name: Sarah Mitchell

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Change these passwords after first login!

✨ Admin user seeding completed!

📡 MongoDB connection closed
```

## Features

### Smart Seeding
- **Idempotent**: Safe to run multiple times
- **No Duplicates**: Skips users that already exist
- **Auto-Upgrade**: Updates existing users to admin role if needed
- **Error Handling**: Continues even if one user fails

### Security
- **Password Hashing**: Uses bcrypt with salt rounds
- **Password History**: Initializes password history
- **Email Verified**: Sets email as verified by default
- **Strong Passwords**: Default passwords meet security requirements

## After Seeding

### 1. Test Admin Login

Go to your application and sign in with any of the admin accounts:

```
http://localhost:8080/auth/signin
```

Use any of the admin credentials listed above.

### 2. Verify Admin Access

After logging in:
- Check that the navbar shows your admin name
- Click on your name dropdown
- You should see "Admin Panel" option
- Click "Admin Panel" to access admin dashboard

### 3. Change Passwords (IMPORTANT!)

For security, change the default passwords:
1. Go to your profile/settings
2. Change password to something secure
3. Do this for all 3 admin accounts

## Customizing Admin Users

To customize the admin users, edit `backend/seeds/adminUsers.js`:

```javascript
const adminUsers = [
  {
    email: 'your.email@example.com',
    password: 'YourSecurePassword123!',
    full_name: 'Your Name',
    company: 'Your Company',
    role: 'admin',
    email_verified: true,
  },
  // Add more admin users...
];
```

Then run the seed script again.

## Troubleshooting

### Error: Cannot connect to MongoDB
- Check your `MONGODB_URI` in `.env`
- Ensure MongoDB is running
- Check network/firewall settings
- Verify IP is whitelisted in MongoDB Atlas

### Error: User already exists
- This is normal if you've run the script before
- The script will skip existing users
- Check the "Skipped" count in the summary

### Error: Validation failed
- Check that email format is valid
- Ensure password meets requirements (min 8 chars, uppercase, lowercase, number)
- Verify all required fields are provided

### Error: bcrypt issues
- Make sure bcrypt is installed: `npm install bcrypt`
- Try reinstalling: `npm uninstall bcrypt && npm install bcrypt`

## Security Best Practices

1. **Change Default Passwords**: Always change default passwords after first login
2. **Use Strong Passwords**: Use passwords with uppercase, lowercase, numbers, and symbols
3. **Limit Admin Access**: Only give admin role to trusted users
4. **Monitor Admin Activity**: Keep logs of admin actions
5. **Regular Audits**: Periodically review admin user list

## Database Verification

To verify admin users were created, you can:

### Using MongoDB Compass
1. Connect to your database
2. Navigate to `earth-intelligence` database
3. Open `userprofiles` collection
4. Look for users with `role: "admin"`

### Using MongoDB Shell
```javascript
db.userprofiles.find({ role: "admin" })
```

### Using the API
```bash
# Sign in as admin
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@earthintelligence.com","password":"Admin@123456"}'
```

## Removing Admin Users

If you need to remove seeded admin users:

### Method 1: MongoDB Compass
1. Open `userprofiles` collection
2. Find the admin user
3. Click delete

### Method 2: MongoDB Shell
```javascript
db.userprofiles.deleteOne({ email: "admin@earthintelligence.com" })
```

### Method 3: Create a cleanup script
Create `backend/seeds/cleanupAdmins.js` to remove all seeded admins.

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify your `.env` configuration
3. Ensure MongoDB is accessible
4. Check the troubleshooting section above
5. Review the seed script logs

---

**Last Updated**: January 2024
