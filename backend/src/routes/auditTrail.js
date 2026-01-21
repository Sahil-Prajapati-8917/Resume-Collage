const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');

// Mock audit trail data (in a real system, this would be stored in a database)
const auditLogs = [];

// Get audit trail logs
router.get('/', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            action, 
            userId, 
            companyId, 
            startDate, 
            endDate,
            severity 
        } = req.query;

        let logs = [...auditLogs];

        // Filter by action type
        if (action) {
            logs = logs.filter(log => log.action === action);
        }

        // Filter by user
        if (userId) {
            logs = logs.filter(log => log.userId === userId);
        }

        // Filter by company
        if (companyId) {
            logs = logs.filter(log => log.companyId === companyId);
        }

        // Filter by date range
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            
            logs = logs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= start && logDate <= end;
            });
        }

        // Filter by severity
        if (severity) {
            logs = logs.filter(log => log.severity === severity);
        }

        // Sort by timestamp (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Pagination
        const total = logs.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedLogs = logs.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: paginatedLogs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get audit log by ID
router.get('/:id', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const log = auditLogs.find(l => l.id === req.params.id);
        
        if (!log) {
            return res.status(404).json({
                success: false,
                error: { message: 'Audit log not found' }
            });
        }

        res.json({
            success: true,
            data: log
        });
    } catch (error) {
        logger.error('Error fetching audit log:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Search audit logs
router.post('/search', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { query, filters = {} } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: { message: 'Search query is required' }
            });
        }

        let logs = [...auditLogs];

        // Apply filters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                logs = logs.filter(log => log[key] === filters[key]);
            }
        });

        // Search in description and details
        const searchQuery = query.toLowerCase();
        logs = logs.filter(log => 
            log.description.toLowerCase().includes(searchQuery) ||
            (log.details && JSON.stringify(log.details).toLowerCase().includes(searchQuery))
        );

        // Sort by timestamp (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            data: logs,
            total: logs.length
        });
    } catch (error) {
        logger.error('Error searching audit logs:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Export audit logs
router.post('/export', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { format = 'json', filters = {} } = req.body;

        let logs = [...auditLogs];

        // Apply filters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                logs = logs.filter(log => log[key] === filters[key]);
            }
        });

        // Sort by timestamp (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (format === 'csv') {
            // Convert to CSV format
            const csvHeaders = ['ID', 'Timestamp', 'User', 'Action', 'Company', 'Severity', 'Description', 'IP Address'];
            const csvData = logs.map(log => [
                log.id,
                log.timestamp,
                log.userEmail || log.userId,
                log.action,
                log.companyName || log.companyId,
                log.severity,
                log.description.replace(/,/g, ';'), // Escape commas
                log.ipAddress
            ]);

            const csvContent = [csvHeaders, ...csvData]
                .map(row => row.join(','))
                .join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
            res.send(csvContent);
        } else {
            // JSON format
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.json');
            res.send(JSON.stringify(logs, null, 2));
        }
    } catch (error) {
        logger.error('Error exporting audit logs:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get audit log statistics
router.get('/stats/summary', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let logs = [...auditLogs];

        // Filter by date range
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            
            logs = logs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= start && logDate <= end;
            });
        }

        // Get statistics
        const stats = {
            totalLogs: logs.length,
            byAction: {},
            bySeverity: {},
            byUser: {},
            byCompany: {},
            recentActivity: logs.slice(0, 10) // Last 10 activities
        };

        logs.forEach(log => {
            // Count by action
            stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
            
            // Count by severity
            stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
            
            // Count by user
            const userKey = log.userEmail || log.userId;
            stats.byUser[userKey] = (stats.byUser[userKey] || 0) + 1;
            
            // Count by company
            const companyKey = log.companyName || log.companyId;
            stats.byCompany[companyKey] = (stats.byCompany[companyKey] || 0) + 1;
        });

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error fetching audit log stats:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get security events
router.get('/security-events', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const securityActions = [
            'LOGIN_FAILED',
            'PASSWORD_CHANGED',
            'PERMISSION_CHANGED',
            'COMPANY_CREATED',
            'COMPANY_DELETED',
            'USER_CREATED',
            'USER_DELETED',
            'USER_DEACTIVATED',
            'PROMPT_MODIFIED',
            'SYSTEM_CONFIG_CHANGED'
        ];

        const securityLogs = auditLogs.filter(log => 
            securityActions.includes(log.action) && 
            log.severity !== 'info'
        );

        // Sort by timestamp (newest first)
        securityLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            data: securityLogs,
            total: securityLogs.length
        });
    } catch (error) {
        logger.error('Error fetching security events:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Helper function to add audit log entry
function addAuditLog(entry) {
    const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...entry
    };

    auditLogs.push(logEntry);
    
    // Keep only last 10000 logs to prevent memory issues
    if (auditLogs.length > 10000) {
        auditLogs.splice(0, auditLogs.length - 10000);
    }

    return logEntry;
}

// Export the addAuditLog function for use in other modules
module.exports = router;
module.exports.addAuditLog = addAuditLog;