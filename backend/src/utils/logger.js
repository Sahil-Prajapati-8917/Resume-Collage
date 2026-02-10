const logger = {
  info: (msg) => console.log(`[INFO]`, msg),
  warn: (msg) => console.warn(`[WARN]`, msg),
  error: (msg, err) => {
    console.error(`[ERROR] ${msg}`);
    if (err) console.error(err);
  },
  debug: (msg) => console.log(`[DEBUG]`, msg),
  logAuth: (action, userId, details) => console.log(`[AUTH] ${action}`, userId, details),
  logDatabase: (op, coll, details) => console.log(`[DB] ${op} ${coll}`, details),
  logApiError: (ep, err, uid) => console.error(`[API_ERROR] ${ep}`, err),
  logProfileUpdate: (uid, changes) => console.log(`[PROFILE]`, uid, changes)
};

module.exports = logger;
