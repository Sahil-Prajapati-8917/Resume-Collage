const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// All system analytics routes require authentication and admin roles
router.use(authenticateToken);
router.use(authorizeRoles(['master_admin', 'ops_admin']));

// Get employer dashboard stats (also used by employers/companies, need to adjust route specifically if needed)
// For now, let's keep it under system analytics but move it to controller
router.get('/employer', analyticsController.getEmployerDashboardStats);

// Get system-wide analytics dashboard
router.get('/dashboard', analyticsController.getSystemStats);

// Get resume processing metrics
router.get('/resume-processing', analyticsController.getResumeProcessingMetrics);

// Get AI model usage analytics
router.get('/ai-usage', analyticsController.getAIUsageAnalytics);

// Get evaluation quality metrics
router.get('/evaluation-quality', analyticsController.getEvaluationQualityMetrics);

// Get recruiter override patterns
router.get('/recruiter-patterns', analyticsController.getRecruiterPatterns);

// Get industry-wise evaluation distribution
router.get('/industry-distribution', analyticsController.getIndustryDistribution);

// Get list of evaluations for oversight
router.get('/evaluations', analyticsController.getEvaluationsList);

// Get cost analytics
router.get('/cost', analyticsController.getCostAnalytics);

module.exports = router;
