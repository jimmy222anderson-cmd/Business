// Simple script to seed content via API
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/content/seed',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 200) {
      console.log('✓ Content seeded successfully!');
    } else {
      console.log('✗ Failed to seed content');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  console.log('\nMake sure the backend server is running on port 5000');
  console.log('Run: cd backend && npm start');
});

req.end();
