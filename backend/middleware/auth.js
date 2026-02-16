const jwt = require('jsonwebtoken');
const UserProfile = require('../models/UserProfile');

/**
 * Middleware to verify JWT token and attach user to request
 * Usage: Add to routes that require authentication
 */
async function requireAuth(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await UserProfile.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not found' 
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication failed' 
    });
  }
}

/**
 * Middleware to require admin role
 * Usage: Add after requireAuth middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required' 
    });
  }

  next();
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserProfile.findById(decoded.userId);
    
    if (user) {
      req.user = user;
      req.userId = user._id;
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth
};
