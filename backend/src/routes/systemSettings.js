const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');

// System configuration settings
const systemConfig = {
    fileUpload: {
        maxFileSize: 10485760, // 10MB
        allowedTypes: ['pdf', 'doc', 'docx', 'txt'],
        maxFilesPerUpload: 10
    },
    aiProviders: {
        openai: { enabled: true, rateLimit: 1000 },
        anthropic: { enabled: true, rateLimit: 500 },
        google: { enabled: false, rateLimit: 200 }
    },
    rateLimits: {
        resumeUpload: { windowMs: 900000, max: 100 }, // 15 minutes, 100 requests
        evaluation: { windowMs: 60000, max: 50 }, // 1 minute, 50 requests
        api: { windowMs: 900000, max: 1000 } // 15 minutes, 1000 requests
    },
    features: {
        customPrompts: true,
        advancedAnalytics: true,
        apiAccess: true,
        bulkImport: true
    },
    maintenance: {
        mode: false,
        message: 'System is undergoing maintenance. Please try again later.',
        scheduled: null
    }
};

// Get system configuration
router.get('/config', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        res.json({
            success: true,
            data: systemConfig
        });
    } catch (error) {
        logger.error('Error fetching system config:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Update system configuration
router.put('/config', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { section, updates } = req.body;

        if (!section || !updates) {
            return res.status(400).json({
                success: false,
                error: { message: 'Section and updates are required' }
            });
        }

        if (!systemConfig[section]) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid configuration section' }
            });
        }

        // Update configuration
        systemConfig[section] = { ...systemConfig[section], ...updates };

        logger.info(`System config updated: ${section} by ${req.user.email}`);

        res.json({
            success: true,
            data: systemConfig[section],
            message: 'Configuration updated successfully'
        });
    } catch (error) {
        logger.error('Error updating system config:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get maintenance status
router.get('/maintenance', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        res.json({
            success: true,
            data: systemConfig.maintenance
        });
    } catch (error) {
        logger.error('Error fetching maintenance status:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Update maintenance mode
router.put('/maintenance', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { mode, message, scheduled } = req.body;

        systemConfig.maintenance.mode = mode;
        if (message) systemConfig.maintenance.message = message;
        if (scheduled) systemConfig.maintenance.scheduled = scheduled;

        logger.info(`Maintenance mode updated: ${mode ? 'ON' : 'OFF'} by ${req.user.email}`);

        res.json({
            success: true,
            data: systemConfig.maintenance,
            message: `Maintenance mode ${mode ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        logger.error('Error updating maintenance mode:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Pause resume processing
router.post('/pause-processing', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        // This would integrate with your queue system (Bull, etc.)
        // For now, we'll just log the action

        logger.info(`Resume processing paused by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Resume processing paused successfully'
        });
    } catch (error) {
        logger.error('Error pausing resume processing:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Resume processing
router.post('/resume-processing', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        // This would integrate with your queue system (Bull, etc.)
        // For now, we'll just log the action

        logger.info(`Resume processing resumed by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Resume processing resumed successfully'
        });
    } catch (error) {
        logger.error('Error resuming resume processing:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Reset processing queue
router.post('/reset-queue', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        // This would integrate with your queue system (Bull, etc.)
        // For now, we'll just log the action

        logger.info(`Processing queue reset by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Processing queue reset successfully'
        });
    } catch (error) {
        logger.error('Error resetting processing queue:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Toggle AI evaluations (fallback mode)
router.put('/ai-evaluations', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { enabled } = req.body;

        // This would integrate with your AI service configuration
        // For now, we'll just log the action

        logger.info(`AI evaluations ${enabled ? 'enabled' : 'disabled'} by ${req.user.email}`);

        res.json({
            success: true,
            message: `AI evaluations ${enabled ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        logger.error('Error toggling AI evaluations:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get feature flags
router.get('/feature-flags', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        res.json({
            success: true,
            data: systemConfig.features
        });
    } catch (error) {
        logger.error('Error fetching feature flags:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Update feature flags
router.put('/feature-flags', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { feature, enabled } = req.body;

        if (!feature || typeof enabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: { message: 'Feature name and enabled status are required' }
            });
        }

        if (!Object.prototype.hasOwnProperty.call(systemConfig.features, feature)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid feature name' }
            });
        }

        systemConfig.features[feature] = enabled;

        logger.info(`Feature flag updated: ${feature} = ${enabled} by ${req.user.email}`);

        res.json({
            success: true,
            data: systemConfig.features,
            message: 'Feature flag updated successfully'
        });
    } catch (error) {
        logger.error('Error updating feature flags:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get rate limiting configuration
router.get('/rate-limits', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        res.json({
            success: true,
            data: systemConfig.rateLimits
        });
    } catch (error) {
        logger.error('Error fetching rate limits:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Update rate limiting configuration
router.put('/rate-limits', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { endpoint, windowMs, max } = req.body;

        if (!endpoint || !windowMs || !max) {
            return res.status(400).json({
                success: false,
                error: { message: 'Endpoint, windowMs, and max are required' }
            });
        }

        if (!systemConfig.rateLimits[endpoint]) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid endpoint' }
            });
        }

        systemConfig.rateLimits[endpoint] = { windowMs, max };

        logger.info(`Rate limit updated: ${endpoint} by ${req.user.email}`);

        res.json({
            success: true,
            data: systemConfig.rateLimits[endpoint],
            message: 'Rate limit updated successfully'
        });
    } catch (error) {
        logger.error('Error updating rate limits:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get AI provider configuration
router.get('/ai-providers', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        res.json({
            success: true,
            data: systemConfig.aiProviders
        });
    } catch (error) {
        logger.error('Error fetching AI providers:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Update AI provider configuration
router.put('/ai-providers', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { provider, enabled, rateLimit } = req.body;

        if (!provider || typeof enabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: { message: 'Provider name and enabled status are required' }
            });
        }

        if (!systemConfig.aiProviders[provider]) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid provider name' }
            });
        }

        systemConfig.aiProviders[provider].enabled = enabled;
        if (rateLimit) systemConfig.aiProviders[provider].rateLimit = rateLimit;

        logger.info(`AI provider updated: ${provider} = ${enabled} by ${req.user.email}`);

        res.json({
            success: true,
            data: systemConfig.aiProviders[provider],
            message: 'AI provider configuration updated successfully'
        });
    } catch (error) {
        logger.error('Error updating AI provider config:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

module.exports = router;