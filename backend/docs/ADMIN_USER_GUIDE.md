# Earth Observation Platform - Admin User Guide

## Overview

This guide provides comprehensive instructions for administrators to manage the Earth Observation Platform backend. As an admin, you have access to manage demo bookings, contact inquiries, quote requests, users, and content.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Admin Dashboard](#admin-dashboard)
3. [Managing Demo Bookings](#managing-demo-bookings)
4. [Managing Contact Inquiries](#managing-contact-inquiries)
5. [Managing Quote Requests](#managing-quote-requests)
6. [Managing Users](#managing-users)
7. [Content Management](#content-management)
8. [Email Notifications](#email-notifications)
9. [Reports and Analytics](#reports-and-analytics)
10. [Best Practices](#best-practices)

---

## Getting Started

### Accessing the Admin Dashboard

1. **Sign In**
   - Navigate to: `https://earthintelligence.com/auth/signin`
   - Enter your admin email and password
   - Click "Sign In"

2. **Verify Admin Access**
   - After signing in, you should see "Admin Dashboard" in the navigation
   - If you don't see this, contact the system administrator to verify your admin role

3. **Admin Dashboard URL**
   - Direct link: `https://earthintelligence.com/admin/dashboard`
   - Requires authentication with admin role

### Admin Permissions

Admin users have access to:
- View all demo bookings, contact inquiries, and quote requests
- Update status of bookings, inquiries, and requests
- Add quote details and pricing
- Manage user accounts
- Edit privacy policy and terms of service
- View analytics and reports
- Send email notifications

Regular users cannot access these features.

---

## Admin Dashboard

### Dashboard Overview

The admin dashboard provides a high-level overview of platform activity:

**Key Metrics**:
- Total Users
- Pending Demo Bookings
- New Contact Inquiries
- Pending Quote Requests
- Recent Activity Feed

**Quick Actions**:
- View All Demo Bookings
- View All Contact Inquiries
- View All Quote Requests
- Manage Users
- Edit Content

### Navigation

The admin dashboard includes the following sections:
- **Dashboard** - Overview and statistics
- **Demo Bookings** - Manage demo requests
- **Contact Inquiries** - Manage contact form submissions
- **Quote Requests** - Manage pricing quote requests
- **Users** - Manage user accounts
- **Content** - Edit privacy policy and terms of service

---

## Managing Demo Bookings

### Viewing Demo Bookings

1. **Access Demo Bookings**
   - Click "Demo Bookings" in the admin navigation
   - Or navigate to: `/admin/demo-bookings`

2. **Booking List View**
   - Displays all demo bookings in a table
   - Columns: Name, Email, Company, Job Title, Status, Date Submitted
   - Default sort: Most recent first

3. **Filter Bookings**
   - Filter by status:
     - **Pending** - New bookings awaiting review
     - **Confirmed** - Bookings confirmed with customer
     - **Completed** - Demos that have been conducted
     - **Cancelled** - Cancelled bookings
   - Use the status dropdown to filter

4. **Search Bookings**
   - Use the search bar to find bookings by:
     - Name
     - Email
     - Company name

### Viewing Booking Details

1. **Click on a Booking**
   - Click any row in the bookings table
   - Opens detailed view with full information

2. **Booking Details Include**:
   - Full Name
   - Email Address
   - Company Name
   - Phone Number
   - Job Title
   - Message/Requirements
   - Status
   - Date Submitted
   - Last Updated

### Updating Booking Status

1. **Open Booking Details**
   - Click on the booking you want to update

2. **Change Status**
   - Click the "Status" dropdown
   - Select new status:
     - **Pending** → **Confirmed**: After scheduling demo with customer
     - **Confirmed** → **Completed**: After demo is conducted
     - **Any Status** → **Cancelled**: If customer cancels or doesn't respond

3. **Save Changes**
   - Click "Update Status"
   - Confirmation message appears
   - Customer receives email notification (if configured)

### Best Practices for Demo Bookings

**Response Time**:
- Respond to new bookings within 24 hours
- Confirm demo date/time within 48 hours

**Communication**:
- Send personalized email to customer
- Include calendar invite for demo
- Provide meeting link (Zoom, Teams, etc.)

**Follow-Up**:
- Mark as "Completed" after demo
- Add notes about customer requirements
- Follow up with quote if interested

**Workflow**:
1. New booking arrives → Status: **Pending**
2. Contact customer and schedule → Status: **Confirmed**
3. Conduct demo → Status: **Completed**
4. If customer doesn't respond → Status: **Cancelled**

---

## Managing Contact Inquiries

### Viewing Contact Inquiries

1. **Access Contact Inquiries**
   - Click "Contact Inquiries" in the admin navigation
   - Or navigate to: `/admin/contact-inquiries`

2. **Inquiry List View**
   - Displays all contact inquiries in a table
   - Columns: Name, Email, Subject, Status, Date Submitted
   - Default sort: Most recent first

3. **Filter Inquiries**
   - Filter by status:
     - **New** - Unread inquiries
     - **In Progress** - Being handled
     - **Resolved** - Issue resolved
     - **Closed** - Inquiry closed
   - Use the status dropdown to filter

4. **Search Inquiries**
   - Use the search bar to find inquiries by:
     - Name
     - Email
     - Subject
     - Message content

### Viewing Inquiry Details

1. **Click on an Inquiry**
   - Click any row in the inquiries table
   - Opens detailed view with full information

2. **Inquiry Details Include**:
   - Full Name
   - Email Address
   - Subject
   - Message
   - Status
   - Date Submitted
   - Last Updated
   - Response History (if any)

### Responding to Inquiries

1. **Open Inquiry Details**
   - Click on the inquiry you want to respond to

2. **Compose Response**
   - Click "Reply" button
   - Opens email composition form
   - Pre-filled with customer's email
   - Write your response

3. **Send Response**
   - Click "Send Email"
   - Email is sent to customer
   - Response is logged in inquiry history

4. **Update Status**
   - After sending response, update status to "In Progress"
   - When issue is resolved, update to "Resolved"
   - Close inquiry when no further action needed

### Best Practices for Contact Inquiries

**Response Time**:
- Respond to new inquiries within 24 hours
- Prioritize urgent inquiries (indicated in subject)

**Communication**:
- Be professional and courteous
- Provide clear and helpful information
- Include relevant links or resources

**Categorization**:
- Tag inquiries by type (technical, sales, partnership, etc.)
- Route to appropriate team member

**Workflow**:
1. New inquiry arrives → Status: **New**
2. Review and start handling → Status: **In Progress**
3. Issue resolved → Status: **Resolved**
4. No further action needed → Status: **Closed**

---

## Managing Quote Requests

### Viewing Quote Requests

1. **Access Quote Requests**
   - Click "Quote Requests" in the admin navigation
   - Or navigate to: `/admin/quote-requests`

2. **Request List View**
   - Displays all quote requests in a table
   - Columns: Name, Email, Company, Industry, Data Volume, Status, Date Submitted
   - Default sort: Most recent first

3. **Filter Requests**
   - Filter by status:
     - **Pending** - New requests awaiting review
     - **Quoted** - Quote sent to customer
     - **Accepted** - Customer accepted quote
     - **Declined** - Customer declined or no response
   - Filter by industry:
     - Financial Services
     - Agriculture
     - Energy
     - Mining
     - Construction
     - Government
     - Environment
     - Insurance
     - Other

4. **Search Requests**
   - Use the search bar to find requests by:
     - Name
     - Email
     - Company name
     - Requirements

### Viewing Request Details

1. **Click on a Request**
   - Click any row in the requests table
   - Opens detailed view with full information

2. **Request Details Include**:
   - Full Name
   - Email Address
   - Company Name
   - Phone Number
   - Industry
   - Estimated Data Volume
   - Detailed Requirements
   - Status
   - Date Submitted
   - Last Updated
   - Quote Details (if added)

### Creating and Sending Quotes

1. **Open Request Details**
   - Click on the request you want to quote

2. **Add Quote Details**
   - Click "Add Quote" button
   - Fill in quote form:
     - **Pricing**: Monthly or annual pricing (e.g., "$5,000/month")
     - **Terms**: Contract terms (e.g., "12-month contract, monthly billing")
     - **Valid Until**: Quote expiration date
     - **Notes**: Additional details (e.g., "Includes 50 TB/month of high-resolution imagery")

3. **Save Quote**
   - Click "Save Quote"
   - Quote details are saved to request

4. **Send Quote to Customer**
   - Click "Send Quote Email"
   - Email is sent to customer with quote details
   - Status automatically updates to "Quoted"

5. **Follow Up**
   - Monitor customer response
   - Update status to "Accepted" if customer accepts
   - Update status to "Declined" if customer declines or doesn't respond

### Best Practices for Quote Requests

**Response Time**:
- Review new requests within 24 hours
- Send quote within 3-5 business days

**Quote Preparation**:
- Review customer requirements carefully
- Consider data volume and industry needs
- Provide competitive but profitable pricing
- Include clear terms and conditions

**Communication**:
- Personalize quote email
- Highlight value proposition
- Include case studies or testimonials
- Provide contact information for questions

**Follow-Up**:
- Follow up 3-5 days after sending quote
- Offer to schedule call to discuss
- Be prepared to negotiate

**Workflow**:
1. New request arrives → Status: **Pending**
2. Review requirements and prepare quote
3. Add quote details and send → Status: **Quoted**
4. Customer accepts → Status: **Accepted**
5. Customer declines or no response → Status: **Declined**

---

## Managing Users

### Viewing Users

1. **Access User Management**
   - Click "Users" in the admin navigation
   - Or navigate to: `/admin/users`

2. **User List View**
   - Displays all registered users in a table
   - Columns: Name, Email, Company, Role, Email Verified, Date Joined
   - Default sort: Most recent first

3. **Filter Users**
   - Filter by role:
     - **User** - Regular users
     - **Admin** - Admin users
   - Filter by email verification status:
     - **Verified** - Email verified
     - **Unverified** - Email not verified

4. **Search Users**
   - Use the search bar to find users by:
     - Name
     - Email
     - Company name

### Viewing User Details

1. **Click on a User**
   - Click any row in the users table
   - Opens detailed view with full information

2. **User Details Include**:
   - Full Name
   - Email Address
   - Company Name
   - Phone Number
   - Job Title
   - Role (User or Admin)
   - Email Verified Status
   - Date Joined
   - Last Sign In
   - Activity History:
     - Demo Bookings
     - Contact Inquiries
     - Quote Requests

### Managing User Roles

1. **Open User Details**
   - Click on the user you want to manage

2. **Change User Role**
   - Click "Edit Role" button
   - Select new role:
     - **User**: Regular user access
     - **Admin**: Full admin access
   - Click "Update Role"
   - Confirmation message appears

**Warning**: Be careful when granting admin access. Admins have full access to all data and settings.

### Deactivating User Accounts

1. **Open User Details**
   - Click on the user you want to deactivate

2. **Deactivate Account**
   - Click "Deactivate Account" button
   - Confirm deactivation
   - User can no longer sign in
   - User data is preserved

3. **Reactivate Account**
   - Click "Reactivate Account" button
   - User can sign in again

### Resetting User Passwords

1. **Open User Details**
   - Click on the user who needs password reset

2. **Send Password Reset Email**
   - Click "Send Password Reset" button
   - Password reset email is sent to user
   - User can reset password via email link

### Best Practices for User Management

**Security**:
- Regularly review admin users
- Remove admin access when no longer needed
- Monitor suspicious activity

**Privacy**:
- Only access user data when necessary
- Follow data protection regulations (GDPR, CCPA)
- Don't share user information

**Support**:
- Help users with account issues
- Verify email addresses if needed
- Assist with password resets

---

## Content Management

### Editing Privacy Policy

1. **Access Content Management**
   - Click "Content" in the admin navigation
   - Or navigate to: `/admin/content`

2. **Select Privacy Policy**
   - Click "Edit Privacy Policy"

3. **Edit Content**
   - Content is organized in sections
   - Each section has:
     - **ID**: Unique identifier (for anchor links)
     - **Title**: Section heading
     - **Content**: Section text (supports HTML)

4. **Add New Section**
   - Click "Add Section"
   - Fill in ID, Title, and Content
   - Click "Save"

5. **Edit Existing Section**
   - Click "Edit" on any section
   - Modify Title or Content
   - Click "Save"

6. **Delete Section**
   - Click "Delete" on any section
   - Confirm deletion

7. **Update Version**
   - Increment version number (e.g., 1.0 → 1.1)
   - Last updated date is automatically set

8. **Publish Changes**
   - Click "Publish"
   - Changes are immediately visible on website

### Editing Terms of Service

Follow the same process as Privacy Policy:
1. Click "Edit Terms of Service"
2. Edit sections as needed
3. Update version number
4. Publish changes

### Best Practices for Content Management

**Legal Review**:
- Have legal team review changes before publishing
- Keep version history for compliance

**Communication**:
- Notify users of significant changes
- Provide summary of changes

**Versioning**:
- Increment version number for each update
- Use semantic versioning (1.0, 1.1, 2.0)

**Backup**:
- Keep backup of previous versions
- Document reason for changes

---

## Email Notifications

### Automatic Email Notifications

The system automatically sends emails for:

**User Actions**:
- Welcome email (new user sign up)
- Email verification
- Password reset
- Password changed confirmation

**Form Submissions**:
- Demo booking confirmation (to customer)
- Demo booking notification (to sales team)
- Contact inquiry confirmation (to customer)
- Contact inquiry notification (to support team)
- Quote request confirmation (to customer)
- Quote request notification (to sales team)

**Admin Actions**:
- Quote sent (to customer)
- Booking status updated (to customer)

### Customizing Email Templates

Email templates are located in `backend/templates/`:

1. **Access Templates**
   - Navigate to `backend/templates/` directory
   - Templates are HTML files

2. **Edit Template**
   - Open template file in text editor
   - Modify HTML and styling
   - Use placeholders for dynamic content:
     - `{{fullName}}` - User's full name
     - `{{email}}` - User's email
     - `{{companyName}}` - Company name
     - `{{resetLink}}` - Password reset link
     - `{{verificationLink}}` - Email verification link

3. **Test Template**
   - Use test email script:
     ```bash
     cd backend
     node scripts/test-email.js
     ```

4. **Deploy Changes**
   - Commit changes to Git
   - Deploy to production

### Email Delivery Monitoring

**SendGrid Dashboard**:
- Monitor email delivery rates
- Check bounce and spam reports
- View open and click rates

**Troubleshooting**:
- Check spam folder if emails not received
- Verify sender email is verified
- Check email service logs

---

## Reports and Analytics

### Available Reports

**User Analytics**:
- Total users
- New users (daily, weekly, monthly)
- User growth rate
- Email verification rate

**Demo Bookings**:
- Total bookings
- Bookings by status
- Bookings by industry
- Conversion rate (bookings → customers)

**Contact Inquiries**:
- Total inquiries
- Inquiries by status
- Average response time
- Resolution rate

**Quote Requests**:
- Total requests
- Requests by industry
- Requests by data volume
- Quote acceptance rate

### Exporting Data

1. **Export to CSV**
   - Click "Export" button on any list view
   - Select date range
   - Click "Download CSV"
   - Opens in Excel or Google Sheets

2. **Export to PDF**
   - Click "Export PDF" button
   - Select report type
   - Click "Generate PDF"

### Generating Custom Reports

1. **Access Reports**
   - Navigate to `/admin/reports`

2. **Select Report Type**
   - Choose from available report types

3. **Configure Parameters**
   - Date range
   - Filters (status, industry, etc.)
   - Grouping (daily, weekly, monthly)

4. **Generate Report**
   - Click "Generate"
   - View report on screen
   - Export if needed

---

## Best Practices

### Daily Tasks

- [ ] Check new demo bookings (respond within 24 hours)
- [ ] Check new contact inquiries (respond within 24 hours)
- [ ] Check new quote requests (acknowledge within 24 hours)
- [ ] Review error logs
- [ ] Monitor email delivery rates

### Weekly Tasks

- [ ] Review pending demo bookings (follow up)
- [ ] Review in-progress contact inquiries (resolve)
- [ ] Review quoted requests (follow up)
- [ ] Generate weekly activity report
- [ ] Review user feedback

### Monthly Tasks

- [ ] Review user growth and engagement
- [ ] Analyze conversion rates (bookings → customers)
- [ ] Review and update content (privacy policy, terms)
- [ ] Audit admin users and permissions
- [ ] Generate monthly performance report

### Security Best Practices

- [ ] Use strong, unique password
- [ ] Enable two-factor authentication (if available)
- [ ] Don't share admin credentials
- [ ] Log out when finished
- [ ] Report suspicious activity
- [ ] Keep browser and OS updated

### Communication Best Practices

- [ ] Respond promptly (within 24 hours)
- [ ] Be professional and courteous
- [ ] Provide clear and helpful information
- [ ] Follow up on pending items
- [ ] Document important conversations

### Data Management Best Practices

- [ ] Only access data when necessary
- [ ] Follow data protection regulations
- [ ] Don't share user information
- [ ] Regularly backup data
- [ ] Archive old records

---

## Keyboard Shortcuts

Speed up your workflow with keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open search |
| `Ctrl/Cmd + N` | New item (context-dependent) |
| `Ctrl/Cmd + S` | Save changes |
| `Ctrl/Cmd + E` | Edit selected item |
| `Ctrl/Cmd + D` | Delete selected item |
| `Esc` | Close modal/dialog |
| `Tab` | Navigate between fields |
| `Enter` | Submit form |

---

## Troubleshooting

### Can't Access Admin Dashboard

**Issue**: "Forbidden" error when accessing admin pages

**Solution**:
1. Verify you're signed in
2. Check your user role (must be "admin")
3. Contact system administrator to grant admin access

### Changes Not Saving

**Issue**: Changes don't persist after saving

**Solution**:
1. Check internet connection
2. Verify you have admin permissions
3. Check browser console for errors
4. Try refreshing page and saving again

### Emails Not Sending

**Issue**: Email notifications not received

**Solution**:
1. Check spam folder
2. Verify email address is correct
3. Check email service status (SendGrid dashboard)
4. Contact system administrator

### Data Not Loading

**Issue**: Lists or details not displaying

**Solution**:
1. Refresh page
2. Clear browser cache
3. Check internet connection
4. Check browser console for errors

---

## Support

For admin support or questions:
- Email: admin-support@earthintelligence.com
- Documentation: https://docs.earthintelligence.com/admin
- Emergency: Contact system administrator

---

## Appendix

### Status Definitions

**Demo Bookings**:
- **Pending**: New booking awaiting review
- **Confirmed**: Demo scheduled with customer
- **Completed**: Demo conducted
- **Cancelled**: Booking cancelled

**Contact Inquiries**:
- **New**: Unread inquiry
- **In Progress**: Being handled
- **Resolved**: Issue resolved
- **Closed**: No further action needed

**Quote Requests**:
- **Pending**: New request awaiting review
- **Quoted**: Quote sent to customer
- **Accepted**: Customer accepted quote
- **Declined**: Customer declined or no response

### User Roles

- **User**: Regular user with access to:
  - Sign in/sign out
  - View own profile
  - Submit forms (demo, contact, quote)
  - View own submissions

- **Admin**: Admin user with access to:
  - All user features
  - Admin dashboard
  - Manage all bookings, inquiries, requests
  - Manage users
  - Edit content
  - View reports

### Industry Options

- Financial Services
- Agriculture
- Energy
- Mining
- Construction
- Government
- Environment
- Insurance
- Other

### Data Volume Ranges

- < 1 TB/month
- 1-10 TB/month
- 10-50 TB/month
- 50-100 TB/month
- \> 100 TB/month
- Not sure

---

## Changelog

**Version 1.0** (January 2024)
- Initial admin user guide
- Documentation for all admin features
- Best practices and workflows

---

*Last Updated: January 15, 2024*
