# Earth Observation Platform - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Earth Observation Platform backend API to production. The platform consists of a Node.js/Express backend with MongoDB database and email notification services.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [MongoDB Setup](#mongodb-setup)
4. [Email Service Configuration](#email-service-configuration)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- MongoDB 6.0+ (local or cloud instance)
- Email service account (SendGrid, AWS SES, or SMTP server)
- Domain name and SSL certificate (for production)
- Server or cloud hosting platform (AWS, DigitalOcean, Heroku, etc.)
- Git installed for version control

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

### Required Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=https://earthintelligence.com

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/earth_intelligence?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# Email Service Configuration (choose one)
# Option 1: SendGrid
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
EMAIL_FROM=noreply@earthintelligence.com
EMAIL_FROM_NAME=Earth Observation Platform

# Option 2: SMTP (e.g., Gmail, AWS SES)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@earthintelligence.com
EMAIL_FROM_NAME=Earth Observation Platform

# Admin Email (for notifications)
ADMIN_EMAIL=admin@earthintelligence.com
SALES_EMAIL=sales@earthintelligence.com
SUPPORT_EMAIL=support@earthintelligence.com

# File Upload Configuration (if using AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=earth-intelligence-uploads

# File Upload Configuration (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Redis Configuration (optional, for session storage)
REDIS_URL=redis://localhost:6379
```

### Generating Secure Secrets

Generate secure random strings for JWT_SECRET and SESSION_SECRET:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Environment-Specific Configuration

**Development** (`.env.development`):
```bash
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/earth_intelligence_dev
```

**Staging** (`.env.staging`):
```bash
NODE_ENV=staging
PORT=3000
FRONTEND_URL=https://staging.earthintelligence.com
MONGODB_URI=mongodb+srv://...staging_database...
```

**Production** (`.env.production`):
```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://earthintelligence.com
MONGODB_URI=mongodb+srv://...production_database...
```

---

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "Shared" (free tier) or "Dedicated" (production)
   - Select your cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and strong password
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Add your current IP
   - For production: Add your server's IP address
   - Or click "Allow Access from Anywhere" (0.0.0.0/0) - less secure

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `earth_intelligence`
   - Add to `.env` as `MONGODB_URI`

6. **Create Database and Collections**
   - The application will automatically create collections on first use
   - Or manually create them:
     ```javascript
     use earth_intelligence
     db.createCollection("userprofiles")
     db.createCollection("demobookings")
     db.createCollection("contactinquiries")
     db.createCollection("quoterequests")
     db.createCollection("newslettersubscriptions")
     db.createCollection("blogposts")
     db.createCollection("contents")
     ```

7. **Create Indexes**
   - Run the index creation script:
     ```bash
     cd backend
     node scripts/create-indexes.js
     ```

### Option 2: Self-Hosted MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install -y mongodb-org
   
   # macOS
   brew install mongodb-community
   
   # Windows
   # Download installer from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # macOS
   brew services start mongodb-community
   ```

3. **Create Database and User**
   ```bash
   mongosh
   ```
   ```javascript
   use earth_intelligence
   db.createUser({
     user: "earth_intel_user",
     pwd: "secure_password_here",
     roles: [{ role: "readWrite", db: "earth_intelligence" }]
   })
   ```

4. **Update Connection String**
   ```bash
   MONGODB_URI=mongodb://earth_intel_user:secure_password_here@localhost:27017/earth_intelligence
   ```

### Database Backup Strategy

**Automated Backups (MongoDB Atlas)**:
- Atlas provides automatic backups
- Configure backup schedule in Atlas dashboard
- Set retention period (7 days minimum recommended)

**Manual Backups (Self-Hosted)**:
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/earth_intelligence" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/earth_intelligence" /backup/20240115
```

---

## Email Service Configuration

### Option 1: SendGrid (Recommended)

1. **Create SendGrid Account**
   - Go to https://sendgrid.com
   - Sign up for a free account (100 emails/day)
   - Or choose a paid plan for production

2. **Create API Key**
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Name: "Earth Observation Platform"
   - Permissions: "Full Access" or "Mail Send"
   - Copy the API key (shown only once)
   - Add to `.env` as `SENDGRID_API_KEY`

3. **Verify Sender Identity**
   - Go to Settings > Sender Authentication
   - Click "Verify a Single Sender"
   - Enter your email address (e.g., noreply@earthintelligence.com)
   - Complete verification process
   - Add verified email to `.env` as `EMAIL_FROM`

4. **Configure Domain Authentication (Production)**
   - Go to Settings > Sender Authentication
   - Click "Authenticate Your Domain"
   - Follow DNS configuration instructions
   - Add CNAME records to your domain's DNS

5. **Test Email Sending**
   ```bash
   cd backend
   node scripts/test-email.js
   ```

### Option 2: AWS SES

1. **Create AWS Account**
   - Go to https://aws.amazon.com
   - Sign up or sign in

2. **Set Up SES**
   - Go to AWS SES console
   - Click "Verify a New Email Address"
   - Enter and verify your sender email
   - Request production access (removes sandbox limitations)

3. **Create SMTP Credentials**
   - Go to SMTP Settings
   - Click "Create My SMTP Credentials"
   - Download credentials
   - Add to `.env`:
     ```bash
     SMTP_HOST=email-smtp.us-east-1.amazonaws.com
     SMTP_PORT=587
     SMTP_USER=your_smtp_username
     SMTP_PASS=your_smtp_password
     ```

### Option 3: Gmail SMTP (Development Only)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2FA

2. **Create App Password**
   - Go to Security > App passwords
   - Select "Mail" and your device
   - Copy the generated password

3. **Configure SMTP**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

**Note**: Gmail has sending limits (500 emails/day). Not recommended for production.

### Email Templates

Email templates are located in `backend/templates/`:
- `welcomeEmail.html` - New user welcome
- `emailVerification.html` - Email verification
- `passwordReset.html` - Password reset
- `demoBookingConfirmation.html` - Demo booking confirmation
- `contactInquiryConfirmation.html` - Contact inquiry confirmation
- `quoteRequestConfirmation.html` - Quote request confirmation

Customize these templates with your branding before deployment.

---

## Deployment Steps

### Step 1: Prepare Application

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/earth-intelligence-platform.git
   cd earth-intelligence-platform/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install --production
   ```

3. **Create Environment File**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your configuration
   ```

4. **Run Database Migrations/Seeds**
   ```bash
   # Seed initial content (privacy policy, terms of service)
   node seeds/content.js
   
   # Create database indexes
   node scripts/create-indexes.js
   ```

5. **Test Application Locally**
   ```bash
   npm start
   # Verify server starts without errors
   # Test API endpoints with Postman
   ```

### Step 2: Deploy to Server

#### Option A: Traditional Server (Ubuntu/Debian)

1. **Connect to Server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone and Setup Application**
   ```bash
   cd /var/www
   git clone https://github.com/your-org/earth-intelligence-platform.git
   cd earth-intelligence-platform/backend
   npm install --production
   ```

5. **Create Environment File**
   ```bash
   nano .env
   # Paste production environment variables
   ```

6. **Start Application with PM2**
   ```bash
   pm2 start server.js --name earth-intelligence-api
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx Reverse Proxy**
   ```bash
   sudo nano /etc/nginx/sites-available/earth-intelligence-api
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name api.earthintelligence.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/earth-intelligence-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

8. **Install SSL Certificate (Let's Encrypt)**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.earthintelligence.com
   ```

#### Option B: Heroku

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create earth-intelligence-api
   ```

4. **Add MongoDB Add-on**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set SENDGRID_API_KEY=your_sendgrid_key
   heroku config:set EMAIL_FROM=noreply@earthintelligence.com
   heroku config:set FRONTEND_URL=https://earthintelligence.com
   # Add all other environment variables
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Run Seeds**
   ```bash
   heroku run node seeds/content.js
   ```

#### Option C: AWS EC2

1. **Launch EC2 Instance**
   - Go to AWS EC2 console
   - Launch instance (Ubuntu 22.04 LTS)
   - Choose instance type (t2.micro for testing, t2.medium+ for production)
   - Configure security group (allow ports 22, 80, 443)
   - Download key pair

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@ec2-instance-ip
   ```

3. **Follow Traditional Server Steps** (Option A above)

4. **Configure Auto-Scaling** (Optional)
   - Create AMI from configured instance
   - Set up Auto Scaling Group
   - Configure Load Balancer

#### Option D: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install --production
   
   COPY . .
   
   EXPOSE 3000
   
   CMD ["node", "server.js"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     api:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=${MONGODB_URI}
         - JWT_SECRET=${JWT_SECRET}
       depends_on:
         - mongodb
       restart: unless-stopped
     
     mongodb:
       image: mongo:6
       volumes:
         - mongodb_data:/data/db
       restart: unless-stopped
   
   volumes:
     mongodb_data:
   ```

3. **Build and Run**
   ```bash
   docker-compose up -d
   ```

### Step 3: Configure Frontend

Update frontend environment variables to point to production API:

```bash
# frontend/.env.production
VITE_API_BASE_URL=https://api.earthintelligence.com/api
```

Build and deploy frontend:
```bash
cd frontend
npm run build
# Deploy dist/ folder to hosting (Vercel, Netlify, S3, etc.)
```

---

## Post-Deployment Verification

### 1. Health Check

Test API health endpoint:
```bash
curl https://api.earthintelligence.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Database Connection

Verify MongoDB connection:
```bash
curl https://api.earthintelligence.com/api/content/privacy
```

Should return privacy policy content.

### 3. Authentication Flow

Test sign up and sign in:
```bash
# Sign up
curl -X POST https://api.earthintelligence.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"TestPass123!"}'

# Sign in
curl -X POST https://api.earthintelligence.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

### 4. Email Delivery

Test email sending:
```bash
cd backend
node scripts/test-email.js
```

Check inbox for test email.

### 5. Form Submissions

Test demo booking:
```bash
curl -X POST https://api.earthintelligence.com/api/demo/book \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@example.com","message":"Test booking"}'
```

### 6. Admin Access

Test admin endpoints with admin JWT token:
```bash
curl https://api.earthintelligence.com/api/admin/demo/bookings \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 7. Performance Testing

Use Apache Bench or similar tool:
```bash
ab -n 1000 -c 10 https://api.earthintelligence.com/api/content/privacy
```

Target: < 200ms average response time

---

## Troubleshooting

### Issue: Server Won't Start

**Symptoms**: Application crashes on startup

**Solutions**:
1. Check environment variables:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env)"
   ```

2. Verify MongoDB connection:
   ```bash
   mongosh "mongodb+srv://..."
   ```

3. Check logs:
   ```bash
   pm2 logs earth-intelligence-api
   # or
   heroku logs --tail
   ```

4. Verify Node.js version:
   ```bash
   node --version  # Should be 18+
   ```

### Issue: Database Connection Failed

**Symptoms**: "MongoNetworkError" or "Authentication failed"

**Solutions**:
1. Verify MongoDB URI format
2. Check database user credentials
3. Verify IP whitelist in MongoDB Atlas
4. Test connection with mongosh:
   ```bash
   mongosh "your_mongodb_uri"
   ```

### Issue: Emails Not Sending

**Symptoms**: Email confirmation not received

**Solutions**:
1. Check email service credentials
2. Verify sender email is verified
3. Check spam folder
4. Test email service:
   ```bash
   node scripts/test-email.js
   ```
5. Check email service logs (SendGrid dashboard)

### Issue: CORS Errors

**Symptoms**: Frontend can't access API

**Solutions**:
1. Verify FRONTEND_URL in .env matches frontend domain
2. Check CORS configuration in server.js:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

### Issue: JWT Token Invalid

**Symptoms**: "Unauthorized" errors

**Solutions**:
1. Verify JWT_SECRET is set and consistent
2. Check token expiration (default 7 days)
3. Clear browser localStorage and sign in again

### Issue: Rate Limiting Too Strict

**Symptoms**: "Too many requests" errors

**Solutions**:
1. Adjust rate limits in .env:
   ```bash
   RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
   RATE_LIMIT_MAX_REQUESTS=100
   ```
2. Restart server

### Issue: High Memory Usage

**Symptoms**: Server crashes or slow performance

**Solutions**:
1. Increase server memory
2. Enable Node.js memory limits:
   ```bash
   node --max-old-space-size=2048 server.js
   ```
3. Check for memory leaks with:
   ```bash
   node --inspect server.js
   ```

---

## Monitoring and Maintenance

### Application Monitoring

**PM2 Monitoring**:
```bash
pm2 monit
pm2 status
pm2 logs earth-intelligence-api
```

**Heroku Monitoring**:
```bash
heroku logs --tail
heroku ps
```

### Database Monitoring

**MongoDB Atlas**:
- Monitor in Atlas dashboard
- Set up alerts for high CPU, memory, or disk usage
- Review slow queries

**Self-Hosted**:
```bash
mongosh
db.serverStatus()
db.currentOp()
```

### Email Service Monitoring

**SendGrid**:
- Monitor in SendGrid dashboard
- Check delivery rates
- Review bounce and spam reports

### Performance Monitoring

**Tools**:
- New Relic
- Datadog
- AWS CloudWatch
- Sentry (error tracking)

### Regular Maintenance Tasks

**Daily**:
- Check error logs
- Monitor email delivery rates
- Review failed API requests

**Weekly**:
- Review database performance
- Check disk space
- Update dependencies (security patches)

**Monthly**:
- Database backup verification
- Security audit
- Performance optimization review
- Update Node.js and dependencies

### Backup Strategy

**Database Backups**:
- Automated daily backups (MongoDB Atlas)
- Weekly manual backups
- Test restore process monthly

**Application Backups**:
- Git repository (version control)
- Environment variables (secure storage)
- Email templates

### Security Updates

**Keep Updated**:
```bash
npm audit
npm audit fix
npm update
```

**Security Checklist**:
- [ ] SSL certificate valid and auto-renewing
- [ ] Environment variables secured
- [ ] Database access restricted by IP
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] CORS properly configured
- [ ] Helmet security headers enabled
- [ ] Regular security audits

---

## Support

For deployment support:
- Email: devops@earthintelligence.com
- Documentation: https://docs.earthintelligence.com
- GitHub Issues: https://github.com/your-org/earth-intelligence-platform/issues

---

## Appendix

### Useful Commands

```bash
# PM2 Commands
pm2 start server.js --name api
pm2 stop api
pm2 restart api
pm2 delete api
pm2 logs api
pm2 monit

# MongoDB Commands
mongosh "mongodb://..."
use earth_intelligence
db.stats()
db.userprofiles.find().limit(10)

# Nginx Commands
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx

# SSL Certificate Renewal
sudo certbot renew
sudo certbot certificates

# Docker Commands
docker-compose up -d
docker-compose down
docker-compose logs -f
docker ps
```

### Environment Variable Reference

See [Environment Variables](#environment-variables) section for complete list.

### Port Configuration

- Backend API: 3000 (default)
- MongoDB: 27017 (default)
- Redis: 6379 (optional)
- Nginx: 80 (HTTP), 443 (HTTPS)

### Firewall Configuration

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```
