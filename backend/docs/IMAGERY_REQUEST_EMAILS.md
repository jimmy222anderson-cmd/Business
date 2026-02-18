# Imagery Request Email Notifications

## Overview
Email notifications have been implemented for satellite imagery requests. When a user submits an imagery request, two emails are automatically sent:
1. **Confirmation email** to the user
2. **Notification email** to the admin/sales team

## Implementation Details

### Email Functions
Two new email functions have been added to the email service:

#### 1. `sendImageryRequestConfirmation(email, name, request)`
Sends a confirmation email to the user who submitted the request.

**Email Content:**
- Request ID for tracking
- Status (PENDING)
- Area of Interest details (type, area, center coordinates)
- Date range
- Urgency level
- Applied filters (resolution, cloud coverage, providers, bands, image types)
- Additional requirements (if provided)
- Next steps and timeline

#### 2. `sendImageryRequestNotification(request)`
Sends a notification email to the admin/sales team.

**Email Content:**
- Request ID
- Urgency badge (color-coded: red for emergency, orange for urgent, green for standard)
- Customer information (name, email, company, phone)
- Area of Interest details
- Date range
- Applied filters
- Additional requirements
- Submission timestamp
- Action required notice

### Integration Points

#### 1. Email Service (`backend/services/email.js`)
- Added `sendImageryRequestConfirmation()` function
- Added `sendImageryRequestNotification()` function
- Both functions generate HTML and plain text versions
- Exported in module.exports

#### 2. Email Helper (`backend/services/emailHelper.js`)
- Added wrapper functions for both email types
- Supports email queue if enabled (USE_EMAIL_QUEUE=true)
- Falls back to direct sending if queue is not available
- Exported in module.exports

#### 3. Email Queue (`backend/queues/emailQueue.js`)
- Added handlers for 'imageryRequestConfirmation' type
- Added handlers for 'imageryRequestNotification' type
- Supports retry logic and error handling

#### 4. Public Imagery Requests Route (`backend/routes/public/imageryRequests.js`)
- Integrated email sending after successful request creation
- Sends confirmation email to user
- Sends notification email to admin
- Errors in email sending don't fail the request (logged only)

## Configuration

### Environment Variables
```env
# Email Service Configuration
EMAIL_SERVICE=resend              # Options: resend, sendgrid, or leave blank for SMTP
EMAIL_API_KEY=your_api_key        # API key for Resend or SendGrid
EMAIL_FROM=noreply@yourdomain.com # Sender email address
SALES_EMAIL=sales@yourdomain.com  # Admin/sales team email for notifications

# Email Queue (Optional)
USE_EMAIL_QUEUE=true              # Enable email queue (requires Redis)
REDIS_URL=redis://127.0.0.1:6379 # Redis connection URL
```

### Email Service Options

#### Option 1: Resend (Recommended)
```env
EMAIL_SERVICE=resend
EMAIL_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

#### Option 2: SendGrid
```env
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

#### Option 3: SMTP (Development)
```env
# Leave EMAIL_SERVICE blank or unset
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
EMAIL_FROM=noreply@yourdomain.com
```

## Testing

### Test Scripts

#### 1. Email Template Test
```bash
node backend/scripts/test-imagery-email-templates.js
```
Verifies email template structure without sending actual emails.

#### 2. Email Sending Test
```bash
node backend/scripts/test-imagery-request-emails.js
```
Creates a test request and sends actual emails (requires email service configuration).

### Manual Testing
1. Start the backend server
2. Submit an imagery request via the API
3. Check email service logs/dashboard for sent emails
4. Verify user receives confirmation email
5. Verify admin receives notification email

## Email Templates

### Confirmation Email Features
- Professional HTML layout
- Request summary in highlighted box
- Clear status indicator
- Formatted AOI details
- List of applied filters
- Next steps and timeline
- Contact information

### Notification Email Features
- Urgent/priority indicator with color coding
- Complete customer information
- Detailed request information
- Action required notice
- Professional formatting for admin review

## Error Handling
- Email sending errors are logged but don't fail the request
- Users still receive successful response even if emails fail
- Failed emails can be retried if using email queue
- Email queue provides automatic retry with exponential backoff

## Future Enhancements
- Status update notification emails
- Quote provided notification emails
- Request approved/completed notification emails
- Email templates with custom branding
- Multi-language support
- Email preferences for users
