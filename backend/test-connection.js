// Quick MongoDB connection test
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('Connection string:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

// Add timeout
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    process.exit(1);
  });
