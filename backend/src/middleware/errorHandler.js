const logger = require('../utils/logger');

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.statusCode = err.statusCode || 500;

  // Log the error
  // logger.error('Error occurred:', {
  //   message: err.message,
  //   stack: err.stack,
  //   url: req.url,
  //   method: req.method,
  //   ip: req.ip,
  //   userAgent: req.get('User-Agent'),
  //   timestamp: new Date().toISOString()
  // });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    };
    error.statusCode = 400;
  }
  // Mongoose duplicate key error
  else if (err.code === 11000) {
    error = {
      code: 'DUPLICATE_ERROR',
      message: 'Duplicate entry detected',
      details: {
        field: Object.keys(err.keyValue)[0],
        value: err.keyValue[Object.keys(err.keyValue)[0]]
      }
    };
    error.statusCode = 400;
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = {
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token'
    };
    error.statusCode = 401;
  }
  // MongoDB connection errors
  else if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    error = {
      code: 'DATABASE_ERROR',
      message: 'Database connection error'
    };
    error.statusCode = 503;
  }
  // File upload errors
  else if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      code: 'FILE_TOO_LARGE',
      message: 'File size exceeds maximum allowed limit'
    };
    error.statusCode = 413;
  }
  else if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      code: 'TOO_MANY_FILES',
      message: 'Too many files uploaded'
    };
    error.statusCode = 400;
  }
  else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      code: 'INVALID_FILE_TYPE',
      message: 'Invalid file type uploaded'
    };
    error.statusCode = 400;
  }
  // Default error
  else {
    error = {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal server error'
    };
  }

  // Don't send error stack in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  }

  res.status(error.statusCode).json({
    error,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
