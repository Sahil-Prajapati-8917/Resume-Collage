const winston = require('winston');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'ai-resume-evaluation-api'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for production
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: process.env.LOG_FILE || 'logs/error.log',
        level: 'error',
        format: winston.format.json()
      }),
      new winston.transports.File({
        filename: process.env.LOG_FILE || 'logs/combined.log',
        format: winston.format.json()
      })
    ] : [])
  ]
});

// Custom methods for different log types
// logger.logRequest = (req, res, statusCode) => {
//   logger.http({
//     method: req.method,
//     url: req.url,
//     statusCode,
//     userAgent: req.get('User-Agent'),
//     ip: req.ip || req.connection.remoteAddress,
//     responseTime: res.responseTime
//   });
// };

logger.logAuth = (action, userId, details = {}) => {
  logger.info({
    type: 'authentication',
    action,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.logDatabase = (operation, collection, details = {}) => {
  logger.info({
    type: 'database',
    operation,
    collection,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.logApiError = (endpoint, error, userId = null) => {
  logger.error({
    type: 'api_error',
    endpoint,
    error: error.message,
    stack: error.stack,
    userId,
    timestamp: new Date().toISOString()
  });
};

logger.logProfileUpdate = (userId, changes) => {
  logger.info({
    type: 'profile_update',
    userId,
    changes,
    timestamp: new Date().toISOString()
  });
};

// Development helper functions
if (process.env.NODE_ENV !== 'production') {
  logger.debug('🚀 Debug mode enabled');
  
  // Add console methods for development
  // logger.logRequest = (req, res, statusCode) => {
  //   console.log(`📡 ${req.method} ${req.url} - ${statusCode}`);
  //   console.log('🔍 User-Agent:', req.get('User-Agent'));
  //   console.log('🌐 IP:', req.ip || req.connection.remoteAddress);
  // };
  
  logger.logAuth = (action, userId, details = {}) => {
    console.log(`🔐 Auth: ${action}`, { userId, ...details });
  };
  
  logger.logDatabase = (operation, collection, details = {}) => {
    console.log(`💾 DB: ${operation} on ${collection}`, details);
  };
  
  logger.logApiError = (endpoint, error, userId = null) => {
    console.error(`❌ API Error: ${endpoint}`, error.message);
  };
  
  logger.logProfileUpdate = (userId, changes) => {
    console.log(`👤 Profile Update:`, { userId, changes });
  };
}

module.exports = logger;
