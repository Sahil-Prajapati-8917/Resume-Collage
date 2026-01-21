const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const resumeRoutes = require('./resume');
const companyRoutes = require('./company');
const hrUserRoutes = require('./hrUser');
const hiringFormRoutes = require('./hiringForm');
const globalHiringFormRoutes = require('./globalHiringForm');
const promptRoutes = require('./prompt');
const promptManagementRoutes = require('./promptManagement');
const industryRoutes = require('./industry');
const evaluationOversightRoutes = require('./evaluationOversight');
const auditTrailRoutes = require('./auditTrail');
const systemAnalyticsRoutes = require('./systemAnalytics');
const systemSettingsRoutes = require('./systemSettings');

// Mount routes with their respective paths
router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/company', companyRoutes);
router.use('/hr-user', hrUserRoutes);
router.use('/hiring-form', hiringFormRoutes);
router.use('/global-hiring-form', globalHiringFormRoutes);
router.use('/prompt', promptRoutes);
router.use('/prompt-management', promptManagementRoutes);
router.use('/industry', industryRoutes);
router.use('/evaluation-oversight', evaluationOversightRoutes);
router.use('/audit-trail', auditTrailRoutes);
router.use('/system-analytics', systemAnalyticsRoutes);
router.use('/system-settings', systemSettingsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
    res.json({
        success: true,
        message: 'API Documentation',
        endpoints: {
            auth: '/api/auth - Authentication endpoints',
            resume: '/api/resume - Resume processing endpoints',
            company: '/api/company - Company management endpoints',
            'hr-user': '/api/hr-user - HR user management endpoints',
            'hiring-form': '/api/hiring-form - Hiring form endpoints',
            'global-hiring-form': '/api/global-hiring-form - Global hiring form endpoints',
            prompt: '/api/prompt - Prompt management endpoints',
            'prompt-management': '/api/prompt-management - Advanced prompt management endpoints',
            industry: '/api/industry - Industry management endpoints',
            'evaluation-oversight': '/api/evaluation-oversight - Evaluation oversight endpoints',
            'audit-trail': '/api/audit-trail - Audit trail endpoints',
            'system-analytics': '/api/system-analytics - System analytics endpoints',
            'system-settings': '/api/system-settings - System configuration endpoints'
        },
        documentation: 'See API_DOCUMENTATION.md for detailed API documentation'
    });
});

module.exports = router;