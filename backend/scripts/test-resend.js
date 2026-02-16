/**
 * Test Resend email service
 */

require('dotenv').config();
const { sendEmail, sendWelcomeEmail } = require('../services/email');

async function testResend() {
  console.log('\n========================================');
  console.log('TESTING RESEND EMAIL SERVICE');
  console.log('========================================\n');

  console.log('Configuration:');
  console.log('  Service:', process.env.EMAIL_SERVICE);
  console.log('  API Key:', process.env.EMAIL_API_KEY ? '✓ Set' : '✗ Not set');
  console.log('  From:', process.env.EMAIL_FROM);
  console.log('');

  try {
    // Test 1: Simple email
    console.log('Test 1: Sending simple test email...');
    const result1 = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email from Earth Intelligence Platform',
      text: 'This is a test email to verify Resend integration.',
      html: '<h1>Test Email</h1><p>This is a test email to verify Resend integration.</p>'
    });
    console.log('✓ Simple email sent successfully!');
    console.log('  Email ID:', result1.id || result1.messageId);
    console.log('');

    // Test 2: Welcome email
    console.log('Test 2: Sending welcome email...');
    const result2 = await sendWelcomeEmail('test@example.com', 'Test User');
    console.log('✓ Welcome email sent successfully!');
    console.log('  Email ID:', result2.id || result2.messageId);
    console.log('');

    console.log('========================================');
    console.log('✓ ALL TESTS PASSED!');
    console.log('========================================\n');
    console.log('Resend is configured correctly and emails are being sent.');
    console.log('Check your Resend dashboard to see the sent emails:');
    console.log('https://resend.com/emails\n');

  } catch (error) {
    console.error('\n✗ EMAIL TEST FAILED');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check that EMAIL_API_KEY is set correctly in .env');
    console.error('2. Verify your Resend API key is valid');
    console.error('3. Check that EMAIL_SERVICE=resend in .env');
    console.error('4. Make sure you have internet connection\n');
    process.exit(1);
  }
}

testResend();
