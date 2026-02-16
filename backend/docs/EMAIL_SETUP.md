# Email Service Configuration Guide

This guide explains how to configure the email service for the Earth Intelligence Platform backend.

## Overview

The platform supports two email service options:
1. **SendGrid** (Recommended for production)
2. **SMTP** (Gmail, Outlook, or custom SMTP server)

## Configuration Steps

### Option 1: SendGrid (Recommended)

SendGrid is a reliable, scalable email service with excellent deliverability rates.

#### 1. Create a SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day) or choose a paid plan
3. Verify your email address

#### 2. Create an API Key

1. Log in to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "Earth Intelligence Platform")
5. Select **Full Access** or **Restricted Access** with Mail Send permissions
6. Copy the API key (you won't be able to see it again!)

#### 3. Verify Sender Identity

1. Go to **Settings** → **Sender Authentication**
2. Choose one of:
   - **Single Sender Verification** (Quick, for testing)
   - **Domain Authentication** (Recommended for production)

For Single Sender:
- Click **Verify a Single Sender**
- Fill in your details
- Verify the email sent to your address

For Domain Authentication:
- Click **Authenticate Your Domain**
- Follow the DNS setup instructions
- Wait for DNS propagation (can take up to 48 hours)

#### 4. Configure Environment Variables

Add to your `.env` file:

```env
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=SG.your-api-key-here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Earth Intelligence Platform
SALES_EMAIL=sales@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

### Option 2: SMTP (Gmail Example)

#### 1. Enable 2-Factor Authentication (Gmail)

1. Go to your Google Account settings
2. Navigate to **Security**
3. Enable **2-Step Verification**

#### 2. Generate App Password

1. In Google Account settings, go to **Security**
2. Under "Signing in to Google", select **App passwords**
3. Select **Mail** and **Other (Custom name)**
4. Name it "Earth Intelligence Platform"
5. Copy the 16-character password

#### 3. Configure Environment Variables

Add to your `.env` file:

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Earth Intelligence Platform
SALES_EMAIL=sales@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

### Option 3: Custom SMTP Server

For other email providers (Outlook, custom server, etc.):

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Earth Intelligence Platform
SALES_EMAIL=sales@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

Common SMTP settings:
- **Gmail**: smtp.gmail.com:587
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Custom**: Check with your email provider

## Testing Email Configuration

Run the test script to verify your email configuration:

```bash
cd backend
node scripts/test-email.js
```

This will send test emails for all email types:
- Welcome email
- Email verification
- Password reset
- Password changed
- Demo booking confirmation
- Contact inquiry confirmation
- Quote request confirmation
- Quote email

### Development Testing with Ethereal Email

For development/testing without a real email service:

1. The service will automatically use Ethereal Email if no configuration is provided
2. Check the console for preview URLs to view sent emails
3. No configuration needed - works out of the box!

## Email Templates

Email templates are located in `backend/templates/`:
- `welcomeEmail.html` - Welcome email for new users
- `emailVerification.html` - Email verification
- `passwordReset.html` - Password reset request

Templates use `{{variable}}` syntax for dynamic content.

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EMAIL_SERVICE` | Yes | Email service type | `sendgrid` or `smtp` |
| `EMAIL_API_KEY` | SendGrid only | SendGrid API key | `SG.xxx...` |
| `SMTP_HOST` | SMTP only | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP only | SMTP server port | `587` |
| `SMTP_USER` | SMTP only | SMTP username | `user@gmail.com` |
| `SMTP_PASS` | SMTP only | SMTP password | `app-password` |
| `EMAIL_FROM` | Yes | Sender email address | `noreply@domain.com` |
| `EMAIL_FROM_NAME` | No | Sender display name | `Earth Intelligence` |
| `SALES_EMAIL` | Yes | Sales team email | `sales@domain.com` |
| `SUPPORT_EMAIL` | Yes | Support team email | `support@domain.com` |
| `FRONTEND_URL` | Yes | Frontend URL for links | `https://yourdomain.com` |

## Troubleshooting

### Emails Not Sending

1. **Check environment variables**: Ensure all required variables are set
2. **Verify API key**: Make sure the SendGrid API key is correct
3. **Check sender verification**: Ensure sender email is verified in SendGrid
4. **SMTP authentication**: Verify SMTP credentials are correct
5. **Firewall/Network**: Ensure port 587 is not blocked
6. **Check logs**: Look for error messages in the console

### Emails Going to Spam

1. **Domain authentication**: Set up SPF, DKIM, and DMARC records
2. **Sender reputation**: Use a verified domain, not a free email service
3. **Email content**: Avoid spam trigger words, include unsubscribe link
4. **Warm up**: Gradually increase sending volume for new domains

### SendGrid Errors

- **401 Unauthorized**: Invalid API key
- **403 Forbidden**: Sender not verified or insufficient permissions
- **429 Too Many Requests**: Rate limit exceeded (upgrade plan)

### SMTP Errors

- **535 Authentication failed**: Wrong username/password
- **550 Relay not permitted**: SMTP server doesn't allow relaying
- **Connection timeout**: Check SMTP host and port

## Production Checklist

Before deploying to production:

- [ ] Configure production email service (SendGrid recommended)
- [ ] Set up domain authentication (SPF, DKIM, DMARC)
- [ ] Verify sender email addresses
- [ ] Test all email types with real email addresses
- [ ] Set up email monitoring and alerts
- [ ] Configure proper `EMAIL_FROM` with your domain
- [ ] Update `SALES_EMAIL` and `SUPPORT_EMAIL` to real addresses
- [ ] Set correct `FRONTEND_URL` for production
- [ ] Review email templates for branding
- [ ] Set up email analytics (SendGrid provides this)
- [ ] Configure unsubscribe handling (for newsletters)

## Best Practices

1. **Use transactional email service**: SendGrid, Mailgun, or AWS SES
2. **Authenticate your domain**: Set up SPF, DKIM, and DMARC
3. **Monitor deliverability**: Track bounce rates and spam complaints
4. **Implement retry logic**: Use email queue for reliability (see task 37.4)
5. **Rate limiting**: Respect email service rate limits
6. **Unsubscribe links**: Include in marketing emails (required by law)
7. **Email validation**: Validate email addresses before sending
8. **Error handling**: Log email failures for debugging
9. **Testing**: Always test emails before deploying
10. **Compliance**: Follow CAN-SPAM, GDPR, and other regulations

## Support

For issues with:
- **SendGrid**: Check [SendGrid Documentation](https://docs.sendgrid.com/)
- **Gmail SMTP**: Check [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- **Platform issues**: Contact the development team

## Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)
- [SPF/DKIM/DMARC Setup](https://www.cloudflare.com/learning/dns/dns-records/)
