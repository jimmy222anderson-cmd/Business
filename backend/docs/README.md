# Earth Observation Platform - Backend Documentation

Welcome to the Earth Observation Platform backend documentation. This directory contains comprehensive guides for developers, administrators, and DevOps teams.

## Documentation Index

### 📚 API Documentation
**File**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

Complete API reference for all backend endpoints including:
- Authentication endpoints (sign up, sign in, password reset)
- Demo booking endpoints
- Contact form endpoints
- Quote request endpoints
- Content management endpoints
- Admin endpoints
- Error codes and rate limiting
- Postman collection for testing

**Use this when**: You need to understand API endpoints, request/response formats, or integrate with the backend.

---

### 🚀 Deployment Guide
**File**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

Step-by-step deployment instructions including:
- Environment variable configuration
- MongoDB setup (Atlas and self-hosted)
- Email service configuration (SendGrid, AWS SES, SMTP)
- Deployment to various platforms (traditional server, Heroku, AWS, Docker)
- Post-deployment verification
- Troubleshooting common issues
- Monitoring and maintenance

**Use this when**: You need to deploy the backend to production or staging environments.

---

### 👨‍💼 Admin User Guide
**File**: [ADMIN_USER_GUIDE.md](./ADMIN_USER_GUIDE.md)

Comprehensive guide for platform administrators including:
- Admin dashboard overview
- Managing demo bookings
- Managing contact inquiries
- Managing quote requests
- Managing users and permissions
- Content management (privacy policy, terms of service)
- Email notifications
- Reports and analytics
- Best practices and workflows

**Use this when**: You need to train administrators or understand admin features.

---

### 🧪 API Testing
**File**: [Earth_Intelligence_Platform.postman_collection.json](./Earth_Intelligence_Platform.postman_collection.json)

Postman collection with all API endpoints and example requests.

**How to use**:
1. Import the collection into Postman
2. Set the `base_url` variable to your API URL
3. Test endpoints with pre-configured requests
4. JWT token is automatically saved after sign in

---

## Quick Links

### For Developers
- [API Documentation](./API_DOCUMENTATION.md) - Understand API endpoints
- [Postman Collection](./Earth_Intelligence_Platform.postman_collection.json) - Test API endpoints
- [Deployment Guide](./DEPLOYMENT_GUIDE.md#troubleshooting) - Troubleshoot issues

### For DevOps
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deploy to production
- [Environment Variables](./DEPLOYMENT_GUIDE.md#environment-variables) - Configure environment
- [MongoDB Setup](./DEPLOYMENT_GUIDE.md#mongodb-setup) - Set up database
- [Monitoring](./DEPLOYMENT_GUIDE.md#monitoring-and-maintenance) - Monitor production

### For Administrators
- [Admin User Guide](./ADMIN_USER_GUIDE.md) - Learn admin features
- [Managing Bookings](./ADMIN_USER_GUIDE.md#managing-demo-bookings) - Handle demo requests
- [Managing Inquiries](./ADMIN_USER_GUIDE.md#managing-contact-inquiries) - Respond to contacts
- [Managing Quotes](./ADMIN_USER_GUIDE.md#managing-quote-requests) - Create and send quotes

---

## Additional Resources

### Backend Code Structure
```
backend/
├── config/          # Database configuration
├── middleware/      # Authentication, validation, rate limiting
├── models/          # MongoDB schemas (User, DemoBooking, etc.)
├── routes/          # API route handlers
├── services/        # Email service, upload service
├── templates/       # Email templates
├── utils/           # Utility functions (token generation, etc.)
├── seeds/           # Database seed scripts
├── scripts/         # Utility scripts (test email, create indexes)
├── docs/            # Documentation (you are here)
└── server.js        # Main application entry point
```

### Environment Setup

**Development**:
```bash
cp .env.example .env
npm install
npm run dev
```

**Production**:
```bash
npm install --production
npm start
```

### Testing

**Run Tests**:
```bash
npm test
```

**Test Email Service**:
```bash
node scripts/test-email.js
```

**Test API Endpoints**:
- Import Postman collection
- Or use curl commands from API documentation

---

## Support

### Documentation Issues
If you find errors or have suggestions for improving documentation:
- Create an issue on GitHub
- Email: docs@earthintelligence.com

### Technical Support
For technical support:
- Developers: dev-support@earthintelligence.com
- DevOps: devops@earthintelligence.com
- Admins: admin-support@earthintelligence.com

### Emergency Contact
For production emergencies:
- Email: emergency@earthintelligence.com
- Phone: +1-555-EMERGENCY

---

## Contributing

When updating documentation:
1. Keep it clear and concise
2. Include code examples
3. Update table of contents
4. Test all commands and examples
5. Update changelog/version

---

## Changelog

**Version 1.0** (January 2024)
- Initial documentation release
- API documentation with all endpoints
- Comprehensive deployment guide
- Admin user guide with workflows
- Postman collection for testing

---

*Last Updated: January 15, 2024*
