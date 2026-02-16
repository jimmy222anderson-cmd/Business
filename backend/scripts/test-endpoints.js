/**
 * Comprehensive endpoint testing script for Phase 3 backend
 * Tests all authentication, form submission, and admin endpoints
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let authToken = null;
let adminToken = null;
let testUserId = null;
let testDemoBookingId = null;
let testContactInquiryId = null;
let testQuoteRequestId = null;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: response, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoint(name, method, path, data = null, token = null, expectedStatus = 200) {
  try {
    log(`\nTesting: ${name}`, 'cyan');
    log(`  ${method} ${path}`, 'blue');
    
    const response = await makeRequest(method, path, data, token);
    
    if (response.status === expectedStatus) {
      log(`  ✓ Status: ${response.status} (Expected: ${expectedStatus})`, 'green');
      if (response.data && typeof response.data === 'object') {
        log(`  Response: ${JSON.stringify(response.data).substring(0, 100)}...`, 'reset');
      }
      return { success: true, data: response.data };
    } else {
      log(`  ✗ Status: ${response.status} (Expected: ${expectedStatus})`, 'red');
      log(`  Response: ${JSON.stringify(response.data)}`, 'red');
      return { success: false, data: response.data };
    }
  } catch (error) {
    log(`  ✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('='.repeat(60), 'yellow');
  log('EARTH INTELLIGENCE PLATFORM - BACKEND ENDPOINT TESTS', 'yellow');
  log('='.repeat(60), 'yellow');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Health Check
  log('\n' + '='.repeat(60), 'yellow');
  log('1. HEALTH CHECK', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const health = await testEndpoint('Server Health', 'GET', '/api/health', null, null, 200);
  health.success ? passedTests++ : failedTests++;

  // Test 2: Authentication - Sign Up
  log('\n' + '='.repeat(60), 'yellow');
  log('2. AUTHENTICATION - SIGN UP', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const signupData = {
    fullName: 'Test User',
    email: `test${Date.now()}@example.com`,
    companyName: 'Test Company',
    password: 'TestPass123!'
  };
  
  const signup = await testEndpoint('Sign Up', 'POST', '/api/auth/signup', signupData, null, 201);
  if (signup.success && signup.data.token) {
    authToken = signup.data.token;
    testUserId = signup.data.user?._id;
    log(`  Token received: ${authToken.substring(0, 20)}...`, 'green');
    passedTests++;
  } else {
    failedTests++;
  }

  // Test 3: Authentication - Sign In
  log('\n' + '='.repeat(60), 'yellow');
  log('3. AUTHENTICATION - SIGN IN', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const signinData = {
    email: signupData.email,
    password: signupData.password
  };
  
  const signin = await testEndpoint('Sign In', 'POST', '/api/auth/signin', signinData, null, 200);
  signin.success ? passedTests++ : failedTests++;

  // Test 4: Authentication - Get Current User
  log('\n' + '='.repeat(60), 'yellow');
  log('4. AUTHENTICATION - GET CURRENT USER', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const me = await testEndpoint('Get Current User', 'GET', '/api/auth/me', null, authToken, 200);
  me.success ? passedTests++ : failedTests++;

  // Test 5: Forgot Password
  log('\n' + '='.repeat(60), 'yellow');
  log('5. AUTHENTICATION - FORGOT PASSWORD', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const forgotPassword = await testEndpoint(
    'Forgot Password',
    'POST',
    '/api/auth/forgot-password',
    { email: signupData.email },
    null,
    200
  );
  forgotPassword.success ? passedTests++ : failedTests++;

  // Test 6: Demo Booking
  log('\n' + '='.repeat(60), 'yellow');
  log('6. DEMO BOOKING', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const demoData = {
    fullName: 'Demo Test User',
    email: 'demo@example.com',
    companyName: 'Demo Company',
    phoneNumber: '+1234567890',
    jobTitle: 'Manager',
    message: 'I would like to book a demo'
  };
  
  const demoBooking = await testEndpoint('Book Demo', 'POST', '/api/demo/book', demoData, null, 201);
  if (demoBooking.success && demoBooking.data._id) {
    testDemoBookingId = demoBooking.data._id;
    passedTests++;
  } else {
    failedTests++;
  }

  // Test 7: Contact Form
  log('\n' + '='.repeat(60), 'yellow');
  log('7. CONTACT FORM', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const contactData = {
    fullName: 'Contact Test User',
    email: 'contact@example.com',
    subject: 'Test Inquiry',
    message: 'This is a test contact inquiry'
  };
  
  const contact = await testEndpoint('Contact Form', 'POST', '/api/contact', contactData, null, 201);
  if (contact.success && contact.data._id) {
    testContactInquiryId = contact.data._id;
    passedTests++;
  } else {
    failedTests++;
  }

  // Test 8: Quote Request
  log('\n' + '='.repeat(60), 'yellow');
  log('8. QUOTE REQUEST', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const quoteData = {
    fullName: 'Quote Test User',
    email: 'quote@example.com',
    companyName: 'Quote Company',
    phoneNumber: '+1234567890',
    industry: 'Financial Services',
    estimatedDataVolume: '1-10 TB/month',
    requirements: 'Need satellite imagery for financial analysis'
  };
  
  const quote = await testEndpoint('Request Quote', 'POST', '/api/quote/request', quoteData, null, 201);
  if (quote.success && quote.data._id) {
    testQuoteRequestId = quote.data._id;
    passedTests++;
  } else {
    failedTests++;
  }

  // Test 9: Newsletter Subscription
  log('\n' + '='.repeat(60), 'yellow');
  log('9. NEWSLETTER SUBSCRIPTION', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const newsletter = await testEndpoint(
    'Newsletter Subscribe',
    'POST',
    '/api/newsletter/subscribe',
    { email: `newsletter${Date.now()}@example.com` },
    null,
    201
  );
  newsletter.success ? passedTests++ : failedTests++;

  // Test 10: Content - Privacy Policy
  log('\n' + '='.repeat(60), 'yellow');
  log('10. CONTENT - PRIVACY POLICY', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const privacy = await testEndpoint('Get Privacy Policy', 'GET', '/api/content/privacy', null, null, 200);
  privacy.success ? passedTests++ : failedTests++;

  // Test 11: Content - Terms of Service
  log('\n' + '='.repeat(60), 'yellow');
  log('11. CONTENT - TERMS OF SERVICE', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const terms = await testEndpoint('Get Terms of Service', 'GET', '/api/content/terms', null, null, 200);
  terms.success ? passedTests++ : failedTests++;

  // Test 12: Blog Posts (Public)
  log('\n' + '='.repeat(60), 'yellow');
  log('12. BLOG POSTS (PUBLIC)', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const blogPosts = await testEndpoint('Get Blog Posts', 'GET', '/api/blog/posts', null, null, 200);
  blogPosts.success ? passedTests++ : failedTests++;

  // Test 13: Rate Limiting
  log('\n' + '='.repeat(60), 'yellow');
  log('13. RATE LIMITING', 'yellow');
  log('='.repeat(60), 'yellow');
  
  log('  Testing rate limiting on auth endpoints...', 'cyan');
  let rateLimitHit = false;
  for (let i = 0; i < 7; i++) {
    const result = await makeRequest('POST', '/api/auth/signin', { email: 'test@test.com', password: 'test' });
    if (result.status === 429) {
      rateLimitHit = true;
      log(`  ✓ Rate limit triggered after ${i + 1} requests`, 'green');
      passedTests++;
      break;
    }
  }
  if (!rateLimitHit) {
    log(`  ✗ Rate limit not triggered`, 'red');
    failedTests++;
  }

  // Test 14: Input Validation
  log('\n' + '='.repeat(60), 'yellow');
  log('14. INPUT VALIDATION', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const invalidEmail = await testEndpoint(
    'Invalid Email Format',
    'POST',
    '/api/auth/signup',
    { email: 'invalid-email', password: 'Test123!' },
    null,
    400
  );
  invalidEmail.success ? passedTests++ : failedTests++;

  const missingFields = await testEndpoint(
    'Missing Required Fields',
    'POST',
    '/api/contact',
    { email: 'test@test.com' },
    null,
    400
  );
  missingFields.success ? passedTests++ : failedTests++;

  // Test 15: CORS Headers
  log('\n' + '='.repeat(60), 'yellow');
  log('15. CORS CONFIGURATION', 'yellow');
  log('='.repeat(60), 'yellow');
  
  const corsTest = await makeRequest('OPTIONS', '/api/health');
  if (corsTest.headers['access-control-allow-origin']) {
    log(`  ✓ CORS headers present`, 'green');
    log(`  Origin: ${corsTest.headers['access-control-allow-origin']}`, 'reset');
    passedTests++;
  } else {
    log(`  ✗ CORS headers missing`, 'red');
    failedTests++;
  }

  // Final Summary
  log('\n' + '='.repeat(60), 'yellow');
  log('TEST SUMMARY', 'yellow');
  log('='.repeat(60), 'yellow');
  log(`Total Tests: ${passedTests + failedTests}`, 'cyan');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`, 'cyan');
  log('='.repeat(60), 'yellow');

  if (failedTests === 0) {
    log('\n✓ ALL TESTS PASSED!', 'green');
  } else {
    log('\n✗ SOME TESTS FAILED', 'red');
    log('Please review the failed tests above and fix the issues.', 'yellow');
  }

  return { passedTests, failedTests };
}

// Run tests
runTests()
  .then(({ passedTests, failedTests }) => {
    process.exit(failedTests > 0 ? 1 : 0);
  })
  .catch(error => {
    log(`\nFatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
