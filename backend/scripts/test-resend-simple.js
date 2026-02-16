/**
 * Simple Resend test
 */

require('dotenv').config();
const { Resend } = require('resend');

async function testResend() {
  console.log('\nTesting Resend API...\n');
  console.log('API Key:', process.env.EMAIL_API_KEY ? 'Set' : 'Not set');
  console.log('From:', process.env.EMAIL_FROM);
  console.log('');

  try {
    const resend = new Resend(process.env.EMAIL_API_KEY);
    
    console.log('Sending test email...');
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
      subject: 'Test Email',
      html: '<h1>Test</h1><p>This is a test email.</p>'
    });

    console.log('\n✓ Email sent successfully!');
    console.log('Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('\n✗ Error sending email:');
    console.error('Message:', error.message);
    console.error('Details:', error);
  }
}

testResend();
