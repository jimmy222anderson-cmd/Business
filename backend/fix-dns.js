// Fix DNS resolution for MongoDB Atlas on Windows
const dns = require('dns');

// Use Google's DNS servers
dns.setServers([
  '8.8.8.8',
  '8.8.4.4',
  '1.1.1.1',
  '1.0.0.1'
]);

console.log('DNS servers set to:', dns.getServers());

// Now test MongoDB connection
require('./test-connection.js');
