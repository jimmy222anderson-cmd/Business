# Email System Overview

## Quick Start

### 1. Configure Email Service

Choose one of the following options:

#### Option A: SendGrid (Recommended for Production)
```env
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

#### Option B: Gmail SMTP
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

#### Option C: Development (No Configuration Needed)
The system automatically uses Ethereal Email for testing. Check console for preview URLs.

### 2. Test Email Configuration

```bash
npm run test:email
```

This sends test emails for all email types and verifies your configuration.

### 3. Use in Your Code

```javascript
const emailHelper = require('./services/emailHelper');

// Send welcome email
await emailHelper.sendWelcomeEmail('user@example.com', 'John Doe');

// Send email verification
await emailHelper.sendEmailVerification('user@example.com', 'John Doe', 'token123');

// Send password reset
await emailHelper.sendPasswordResetEmail('user@example.com', 'John Doe', 'reset-token');
```

## Email Types

The system supports the following email types:

### Authentication Emails
- **Welcome Email**: Sent when user signs up
- **Email Verification**: Sent to verify email address
- **Password Reset**: Sent when user requests password reset
- **Password Changed**: Sent when password is successfully changed

### Form Emails
- **Demo Booking Confirmation**: Sent to user after booking demo
- **Demo Booking Notification**: Sent to sales team for new demo bookings
- **Contact Inquiry Confirmation**: Sent to user after submitting contact form
- **Contact Inquiry Notification**: Sent to support team for new inquiries
- **Quote Request Confirmation**: Sent to user after requesting quote
- **Quote Request Notification**: Sent to sales team for new quote requests
- **Quote Email**: Sent to customer with custom pricing quote

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Routes, Controllers, Business Logic)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Email Helper                              │
│  (Unified interface - uses queue if available)              │
└─────────────┬───────────────────────────┬───────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────────┐
│    Email Queue          │   │    Email Service            │
│  (Optional - Bull)      │   │  (Direct sending)           │
│  - Retry logic          │   │  - Nodemailer               │
│  - Job tracking         │   │  - SendGrid/SMTP            │
│  - Rate limiting        │   │  - Templates                │
└─────────────┬───────────┘   └─────────────┬───────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
                    ┌─────────────────────┐
                    │  Email Provider     │
                    │  (SendGrid/SMTP)    │
                    └─────────────────────┘
```

## Features

### 1. Email Templates
- Professional HTML templates with responsive design
- Consistent branding across all emails
- Dark theme matching platform design
- Located in `backend/templates/`

### 2. Email Service
- Support for SendGrid and SMTP
- Automatic fallback to Ethereal Email for development
- Template loading and variable substitution
- Error handling and logging

### 3. Email Helper
- Unified interface for sending emails
- Automatic queue usage when enabled
- Fallback to direct sending if queue unavailable
- Simple API for all email types

### 4. Email Queue (Optional)
- Reliable email delivery with retry logic
- Asynchronous processing (non-blocking)
- Job tracking and monitoring
- Admin dashboard for queue management
- Requires Redis

## Configuration Files

- **`.env`**: Environment variables for email configuration
- **`services/email.js`**: Core email service with Nodemailer
- **`services/emailHelper.js`**: Unified email interface
- **`queues/emailQueue.js`**: Optional email queue implementation
- **`templates/*.html`**: Email HTML templates
- **`scripts/test-email.js`**: Email testing script

## Documentation

- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)**: Detailed setup guide for email services
- **[EMAIL_QUEUE.md](./EMAIL_QUEUE.md)**: Email queue documentation (optional feature)
- **[EMAIL_README.md](./EMAIL_README.md)**: This file - overview and quick start

## Environment Variables

### Required
```env
EMAIL_SERVICE=sendgrid|smtp
EMAIL_FROM=noreply@yourdomain.com
SALES_EMAIL=sales@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### SendGrid
```env
EMAIL_API_KEY=your-sendgrid-api-key
```

### SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### Optional (Email Queue)
```env
USE_EMAIL_QUEUE=true
REDIS_URL=redis://127.0.0.1:6379
```

## Testing

### Test All Email Types
```bash
npm run test:email
```

### Test Specific Email Type
```javascript
const emailService = require('./services/email');

// Test welcome email
await emailService.sendWelcomeEmail('test@example.com', 'Test User');
```

### Development Testing
No configuration needed! The system uses Ethereal Email automatically:
1. Run your app
2. Trigger an email
3. Check console for preview URL
4. Click URL to view email in browser

## Troubleshooting

### Emails Not Sending
1. Check environment variables are set correctly
2. Verify email service credentials (API key or SMTP password)
3. Check sender email is verified (SendGrid)
4. Review console logs for error messages
5. Run `npm run test:email` to diagnose issues

### Emails Going to Spam
1. Set up domain authentication (SPF, DKIM, DMARC)
2. Use verified sender domain (not free email services)
3. Avoid spam trigger words in email content
4. Include unsubscribe link in marketing emails

### Queue Not Working
1. Ensure Redis is running: `redis-cli ping`
2. Check `USE_EMAIL_QUEUE=true` in .env
3. Verify `REDIS_URL` is correct
4. Check Redis connection logs

## Best Practices

1. **Use SendGrid for production**: Better deliverability than SMTP
2. **Verify your domain**: Set up SPF, DKIM, and DMARC records
3. **Test before deploying**: Run `npm run test:email` in staging
4. **Monitor email delivery**: Track bounce rates and failures
5. **Use email queue**: Enable queue for reliability and performance
6. **Handle errors gracefully**: Log failures and retry automatically
7. **Keep templates updated**: Maintain consistent branding
8. **Respect rate limits**: Don't exceed email provider limits
9. **Include unsubscribe**: Required by law for marketing emails
10. **Secure credentials**: Never commit API keys to version control

## Support

For issues or questions:
1. Check documentation in `backend/docs/`
2. Review error logs in console
3. Test with `npm run test:email`
4. Check email provider documentation
5. Contact development team

## Next Steps

1. **Configure email service**: Follow [EMAIL_SETUP.md](./EMAIL_SETUP.md)
2. **Test configuration**: Run `npm run test:email`
3. **Optional: Set up queue**: Follow [EMAIL_QUEUE.md](./EMAIL_QUEUE.md)
4. **Deploy to production**: Update environment variables
5. **Monitor delivery**: Set up alerts for failures
