const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dns = require('dns');
const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');
require('dotenv').config();

// Fix DNS resolution for MongoDB Atlas on Windows
// Use Google's DNS servers to resolve SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

const app = express();

// Connect to MongoDB
connectDB();

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
}));

// Middleware
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8003',  // Lovable frontend
      'http://localhost:8081',  // Lovable frontend (actual port)
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8003',
      'http://127.0.0.1:8081'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // 10 minutes
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Earth Intelligence Platform API is running' });
});

// Test routes for authentication middleware
const { requireAuth, requireAdmin } = require('./middleware/auth');

app.get('/api/test/protected', requireAuth, (req, res) => {
  res.json({ 
    message: 'This is a protected route',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

app.get('/api/test/admin', requireAuth, requireAdmin, (req, res) => {
  res.json({ 
    message: 'This is an admin-only route',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const inquiryRoutes = require('./routes/inquiries');
const demoRoutes = require('./routes/demo');
const contactRoutes = require('./routes/contact');
const quoteRoutes = require('./routes/quote');
const contentRoutes = require('./routes/content');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
