# CMS Deployment Checklist

## Pre-Deployment

### Code Review
- [ ] All code committed to repository
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials
- [ ] All TODO comments addressed
- [ ] Code follows project conventions

### Testing
- [ ] All CRUD operations tested
- [ ] Image upload tested
- [ ] Authentication tested
- [ ] API endpoints tested
- [ ] Frontend pages tested
- [ ] Error handling tested
- [ ] Mobile responsiveness tested

### Documentation
- [ ] README files complete
- [ ] API documentation updated
- [ ] Environment variables documented
- [ ] Deployment guide created
- [ ] Admin user guide available

## Environment Setup

### Production Database
- [ ] MongoDB instance created
- [ ] Database user created with appropriate permissions
- [ ] Connection string obtained
- [ ] Database backed up (if migrating)
- [ ] Indexes created

### Backend Environment Variables
```env
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secure-secret-here
NODE_ENV=production
PORT=3000

# Optional
FRONTEND_URL=https://yourdomain.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

- [ ] All environment variables set
- [ ] JWT_SECRET is strong and unique
- [ ] MONGODB_URI points to production database
- [ ] NODE_ENV set to "production"
- [ ] FRONTEND_URL configured correctly

### Frontend Environment Variables
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

- [ ] VITE_API_BASE_URL points to production API
- [ ] Build tested with production variables

## Database Migration

### Backup
- [ ] Existing database backed up (if applicable)
- [ ] Backup tested and verified
- [ ] Rollback plan documented

### Migration
- [ ] Migration script reviewed
- [ ] Test migration on staging database
- [ ] Run migration on production:
  ```bash
  cd backend
  node scripts/migrate-content.js
  ```
- [ ] Verify data migrated correctly
- [ ] Check all relationships intact

### Admin Users
- [ ] Admin users created
- [ ] Passwords are strong
- [ ] Email addresses verified
- [ ] Roles assigned correctly

## Backend Deployment

### Server Setup
- [ ] Node.js installed (v16+ recommended)
- [ ] PM2 or similar process manager installed
- [ ] Nginx or Apache configured (if applicable)
- [ ] SSL certificate installed
- [ ] Firewall configured

### Application Deployment
- [ ] Code deployed to server
- [ ] Dependencies installed: `npm install --production`
- [ ] Environment variables set
- [ ] File upload directory created with correct permissions
- [ ] Application started
- [ ] Process manager configured for auto-restart

### Health Checks
- [ ] API health endpoint responding: `/api/health`
- [ ] Database connection working
- [ ] File uploads working
- [ ] Authentication working
- [ ] CORS configured correctly

## Frontend Deployment

### Build
- [ ] Production build created: `npm run build`
- [ ] Build output verified
- [ ] No build errors or warnings
- [ ] Assets optimized

### Hosting
- [ ] Static files deployed to hosting (Vercel, Netlify, S3, etc.)
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CDN configured (if applicable)
- [ ] Caching headers set

### Verification
- [ ] Homepage loads correctly
- [ ] All routes accessible
- [ ] API calls working
- [ ] Images loading
- [ ] No console errors

## Security

### SSL/TLS
- [ ] SSL certificate installed
- [ ] HTTPS enforced
- [ ] Certificate auto-renewal configured
- [ ] Mixed content warnings resolved

### Authentication
- [ ] JWT secret is strong and unique
- [ ] Token expiration configured
- [ ] Refresh token mechanism (if implemented)
- [ ] Password hashing verified

### API Security
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

### File Upload Security
- [ ] File type validation working
- [ ] File size limits enforced
- [ ] Upload directory permissions correct
- [ ] Malicious file detection (if implemented)

## Performance

### Backend
- [ ] Database indexes created
- [ ] Query optimization reviewed
- [ ] Connection pooling configured
- [ ] Caching strategy implemented (if applicable)
- [ ] Response compression enabled

### Frontend
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading configured
- [ ] Bundle size optimized
- [ ] CDN configured for static assets

## Monitoring

### Logging
- [ ] Application logging configured
- [ ] Error logging working
- [ ] Log rotation set up
- [ ] Log aggregation configured (optional)

### Monitoring Tools
- [ ] Uptime monitoring configured
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Performance monitoring enabled
- [ ] Database monitoring active

### Alerts
- [ ] Downtime alerts configured
- [ ] Error rate alerts set
- [ ] Disk space alerts enabled
- [ ] Database connection alerts active

## Testing in Production

### Smoke Tests
- [ ] Homepage loads
- [ ] Login works
- [ ] Admin dashboard accessible
- [ ] Create content works
- [ ] Edit content works
- [ ] Delete content works
- [ ] Image upload works
- [ ] Public pages show content

### User Acceptance Testing
- [ ] Admin users can login
- [ ] Content management works
- [ ] Images upload successfully
- [ ] Changes reflect on frontend
- [ ] No errors in console
- [ ] Mobile experience acceptable

## Documentation

### For Admins
- [ ] Admin panel guide shared
- [ ] Login credentials provided
- [ ] Training session conducted (if needed)
- [ ] Support contact provided

### For Developers
- [ ] Deployment documentation updated
- [ ] API documentation accessible
- [ ] Environment variables documented
- [ ] Troubleshooting guide available

## Post-Deployment

### Immediate (First Hour)
- [ ] Monitor error logs
- [ ] Check application performance
- [ ] Verify all features working
- [ ] Test critical user flows
- [ ] Monitor database performance

### First Day
- [ ] Review error logs
- [ ] Check user feedback
- [ ] Monitor server resources
- [ ] Verify backups running
- [ ] Test admin workflows

### First Week
- [ ] Analyze performance metrics
- [ ] Review error patterns
- [ ] Gather user feedback
- [ ] Optimize as needed
- [ ] Document any issues

## Rollback Plan

### If Issues Occur
1. [ ] Stop new deployments
2. [ ] Assess severity
3. [ ] Check error logs
4. [ ] Attempt quick fix if possible
5. [ ] Rollback if necessary

### Rollback Steps
- [ ] Restore previous code version
- [ ] Restore database backup (if needed)
- [ ] Verify rollback successful
- [ ] Notify stakeholders
- [ ] Document issue for post-mortem

## Maintenance

### Regular Tasks
- [ ] Database backups scheduled
- [ ] Log rotation configured
- [ ] Security updates planned
- [ ] Performance reviews scheduled
- [ ] Content audits planned

### Backup Strategy
- [ ] Daily database backups
- [ ] Weekly full backups
- [ ] Backup retention policy defined
- [ ] Backup restoration tested
- [ ] Off-site backup storage

## Sign-Off

### Deployment Team
- [ ] Backend developer sign-off
- [ ] Frontend developer sign-off
- [ ] DevOps engineer sign-off
- [ ] QA tester sign-off

### Stakeholders
- [ ] Project manager approval
- [ ] Product owner approval
- [ ] Security team approval (if applicable)

## Deployment Date

**Planned Deployment**: _______________

**Actual Deployment**: _______________

**Deployed By**: _______________

**Verified By**: _______________

## Notes

### Issues Encountered
```
[Document any issues encountered during deployment]
```

### Resolutions
```
[Document how issues were resolved]
```

### Lessons Learned
```
[Document lessons learned for future deployments]
```

---

## Quick Reference

### Deployment Commands

**Backend**
```bash
# Install dependencies
npm install --production

# Run migration
node scripts/migrate-content.js

# Start with PM2
pm2 start server.js --name "cms-backend"
pm2 save
pm2 startup
```

**Frontend**
```bash
# Build
npm run build

# Deploy (example for Vercel)
vercel --prod
```

### Health Check URLs
- Backend: `https://api.yourdomain.com/api/health`
- Frontend: `https://yourdomain.com`
- Admin: `https://yourdomain.com/admin/dashboard`

### Emergency Contacts
- DevOps: _______________
- Backend Lead: _______________
- Frontend Lead: _______________
- Project Manager: _______________

---

**Remember**: Always test in staging before deploying to production!

**Status**: [ ] Not Started | [ ] In Progress | [ ] Complete | [ ] Verified
