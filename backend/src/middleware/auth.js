const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      console.log(`Auth failed: No token for ${req.method} ${req.url}`);
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. No token provided.'
        }
      });
    }

    // Check if token starts with Bearer
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. Invalid token format.'
        }
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' from string

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).lean();

    if (!user) {
      console.log(`Auth failed: User ${decoded.id} not found in database`);
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. User not found.'
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Access denied. Account has been disabled.'
        }
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log(`Auth failed: Token expired for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access denied. Token has expired.'
        }
      });
    }

    if (error.name === 'JsonWebTokenError') {
      console.log(`Auth failed: Invalid token for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. Invalid token.'
        }
      });
    }

    logger.error('Auth middleware error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error in authentication.'
      }
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  // Flatten roles in case an array was passed as the first argument
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. Authentication required.'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. Insufficient permissions.'
        }
      });
    }

    next();
  };
};

module.exports = { authenticateToken: auth, authorizeRoles: authorizeRoles };
