/**
 * Email Service Test Script
 * 
 * This script tests the email service configuration and sends test emails
 * to verify that the email service is working correctly.
 * 
 * Usage:
 *   node scripts/test-email.js
 * 
 * Make sure to configure your .env file with the correct email settings before running.
 */

require('dotenv').config();
const emailService = require('../services/email');

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...\n');
  
  // Check environment variables
  console.log('📋 Configuration:');
  console.log(`  EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'Not set'}`);
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);
  console.log(`  SALES_EMAIL: ${process.env.SALES_EMAIL || 'Not set'}`);
  console.log(`  SUPPORT_EMAIL: ${process.env.SUPPORT_EMAIL || 'Not set'}`);
  console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log('');
  
  // Test email address (change this to your test email)
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testName = 'Test User';
  
  console.log(`📧 Sending test emails to: ${testEmail}\n`);
  
  try {
    // Test 1: Welcome Email
    console.log('1️⃣  Testing Welcome Email...');
    await emailService.sendWelcomeEmail(testEmail, testName);
    console.log('   ✅ Welcome email sent successfully\n');
    
    // Test 2: Email Verification
    console.log('2️⃣  Testing Email Verification...');
    await emailService.sendEmailVerification(testEmail, testName, 'test-verification-token-123');
    console.log('   ✅ Email verification sent successfully\n');
    
    // Test 3: Password Reset
    console.log('3️⃣  Testing Password Reset Email...');
    await emailService.sendPasswordResetEmail(testEmail, testName, 'test-reset-token-456');
    console.log('   ✅ Password reset email sent successfully\n');
    
    // Test 4: Password Changed
    console.log('4️⃣  Testing Password Changed Email...');
    await emailService.sendPasswordChangedEmail(testEmail, testName);
    console.log('   ✅ Password changed email sent successfully\n');
    
    // Test 5: Demo Booking Confirmation
    console.log('5️⃣  Testing Demo Booking Confirmation...');
    await emailService.sendDemoConfirmation(testEmail, testName, 'demo-booking-789');
    console.log('   ✅ Demo booking confirmation sent successfully\n');
    
    // Test 6: Contact Inquiry Confirmation
    console.log('6️⃣  Testing Contact Inquiry Confirmation...');
    await emailService.sendContactConfirmation(testEmail, testName);
    console.log('   ✅ Contact inquiry confirmation sent successfully\n');
    
    // Test 7: Quote Request Confirmation
    console.log('7️⃣  Testing Quote Request Confirmation...');
    await emailService.sendQuoteRequestConfirmation(testEmail, testName, 'quote-request-101');
    console.log('   ✅ Quote request confirmation sent successfully\n');
    
    // Test 8: Quote Email
    console.log('8️⃣  Testing Quote Email...');
    const quoteDetails = {
      pricing: '$5,000/month for 10TB data volume',
      terms: 'Annual contract with monthly billing. 30-day money-back guarantee.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };
    await emailService.sendQuoteEmail(testEmail, testName, quoteDetails);
    console.log('   ✅ Quote email sent successfully\n');
    
    console.log('🎉 All email tests passed successfully!');
    console.log('\n💡 Tips:');
    console.log('   - Check your email inbox for the test emails');
    console.log('   - If using Ethereal Email (development), check the console for preview URLs');
    console.log('   - Make sure to configure production email service before deploying');
    
  } catch (error) {
    console.error('\n❌ Email test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your .env file configuration');
    console.error('   2. Verify EMAIL_SERVICE is set to "sendgrid" or "smtp"');
    console.error('   3. For SendGrid: Verify EMAIL_API_KEY is correct');
    console.error('   4. For SMTP: Verify SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS');
    console.error('   5. Check your internet connection');
    process.exit(1);
  }
}

// Run the test
testEmailService();
