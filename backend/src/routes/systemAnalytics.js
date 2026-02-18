const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const User = require('../models/User');
const Company = require('../models/Company');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');
const analyticsController = require('../controllers/analyticsController');

// Get employer dashboard stats
router.get('/employer', authenticateToken, analyticsController.getEmployerDashboardStats);

// Get system-wide analytics dashboard
router.get('/dashboard', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { dateRange = '30d' } = req.query;

        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get key metrics
        const metrics = await getSystemMetrics(startDate);

        // Get trends
        const trends = await getSystemTrends(startDate);

        // Get performance metrics
        const performance = await getPerformanceMetrics(startDate);

        // Get Industry & Override Stats
        const industryStats = await getIndustryStats(startDate);
        const overrideStats = await getOverrideStats(startDate);

        res.json({
            success: true,
            data: {
                metrics,
                trends,
                performance,
                industryStats,
                overrideStats,
                dateRange,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        logger.error('Error fetching system analytics:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get resume processing metrics
router.get('/resume-processing', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { dateRange = '30d' } = req.query;

        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const metrics = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalResumes: { $sum: 1 },
                    processedResumes: {
                        $sum: { $cond: [{ $in: ['$status', ['evaluated', 'human_reviewed']] }, 1, 0] }
                    },
                    failedResumes: {
                        $sum: { $cond: ['$processingError', 1, 0] }
                    },
                    avgProcessingTime: { $avg: '$processingTime' },
                    byStatus: {
                        $push: '$status'
                    },
                    byFileType: {
                        $push: '$fileType'
                    }
                }
            }
        ]);

        const successRate = metrics[0] ?
            (metrics[0].processedResumes / metrics[0].totalResumes) * 100 : 0;

        res.json({
            success: true,
            data: {
                ...metrics[0],
                successRate: Math.round(successRate * 100) / 100,
                dateRange
            }
        });
    } catch (error) {
        logger.error('Error fetching resume processing metrics:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get AI model usage analytics
router.get('/ai-usage', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { dateRange = '30d', modelProvider } = req.query;

        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const matchQuery = {
            createdAt: { $gte: startDate },
            'aiEvaluation.model': modelProvider || { $exists: true }
        };

        const usage = await Resume.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: {
                        model: '$aiEvaluation.model',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                    },
                    count: { $sum: 1 },
                    avgScore: { $avg: '$aiEvaluation.totalScore' },
                    avgConfidence: { $avg: '$aiEvaluation.confidence' },
                    avgTime: { $avg: '$aiEvaluation.processingTime' }
                }
            },
            {
                $sort: { '_id.date': 1, '_id.model': 1 }
            }
        ]);

        // Get model distribution
        const distribution = await Resume.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: '$aiEvaluation.model',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$aiEvaluation.totalScore' },
                    avgConfidence: { $avg: '$aiEvaluation.confidence' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                usage,
                distribution,
                dateRange
            }
        });
    } catch (error) {
        logger.error('Error fetching AI usage analytics:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get evaluation quality metrics
router.get('/evaluation-quality', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { dateRange = '30d' } = req.query;

        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const quality = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $in: ['evaluated', 'human_reviewed'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalEvaluations: { $sum: 1 },
                    avgAiScore: { $avg: '$aiEvaluation.totalScore' },
                    avgConfidence: { $avg: '$aiEvaluation.confidence' },
                    totalOverrides: {
                        $sum: { $cond: ['$humanOverride.isOverridden', 1, 0] }
                    },
                    avgOverrideTime: { $avg: '$humanOverride.overrideTime' },
                    avgOverrideScore: { $avg: '$humanOverride.finalScore' }
                }
            }
        ]);

        // Get false positive/negative trends (simplified)
        const trends = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $in: ['evaluated', 'human_reviewed'] }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        hasOverride: '$humanOverride.isOverridden'
                    },
                    count: { $sum: 1 },
                    avgAiScore: { $avg: '$aiEvaluation.totalScore' },
                    avgHumanScore: { $avg: '$humanOverride.finalScore' }
                }
            },
            {
                $sort: { '_id.date': 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                quality: quality[0] || {},
                trends,
                dateRange
            }
        });
    } catch (error) {
        logger.error('Error fetching evaluation quality metrics:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get recruiter override patterns
router.get('/recruiter-patterns', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { dateRange = '30d', companyId } = req.query;

        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const matchQuery = {
            createdAt: { $gte: startDate },
            'humanOverride.isOverridden': true
        };

        if (companyId) {
            matchQuery.company = companyId;
        }

        const patterns = await Resume.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: '$uploadedBy',
                    overrideCount: { $sum: 1 },
                    avgOverrideTime: { $avg: '$humanOverride.overrideTime' },
                    avgAiScore: { $avg: '$aiEvaluation.totalScore' },
                    avgOverrideScore: { $avg: '$humanOverride.finalScore' },
                    reasons: { $push: '$humanOverride.reason' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $sort: { overrideCount: -1 }
            },
            {
                $limit: 20
            }
        ]);

        res.json({
            success: true,
            data: {
                patterns,
                dateRange
            }
        });
    } catch (error) {
        logger.error('Error fetching recruiter patterns:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get industry-wise evaluation distribution
router.get('/industry-distribution', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { dateRange = '30d' } = req.query;

        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const distribution = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$industry',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$aiEvaluation.totalScore' },
                    avgConfidence: { $avg: '$aiEvaluation.confidence' },
                    overrideRate: {
                        $avg: { $cond: ['$humanOverride.isOverridden', 1, 0] }
                    }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                distribution,
                dateRange
            }
        });
    } catch (error) {
        logger.error('Error fetching industry distribution:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

async function getIndustryStats(startDate) {
    const distribution = await Resume.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$industry',
                value: { $sum: 1 },
                overrides: { $sum: { $cond: ['$humanOverride.isOverridden', 1, 0] } }
            }
        },
        { $sort: { value: -1 } },
        { $limit: 10 }
    ]);

    return distribution;
}

async function getOverrideStats(startDate) {
    // Return empty array for now as it's handled in logic
    return [];
}

// Helper functions
async function getSystemMetrics(startDate) {
    const [
        totalCompanies,
        totalUsers,
        totalResumes,
        totalEvaluations,
        activeCompanies
    ] = await Promise.all([
        Company.countDocuments({ status: 'active' }),
        User.countDocuments({ isActive: true }),
        Resume.countDocuments({ createdAt: { $gte: startDate } }),
        Resume.countDocuments({
            createdAt: { $gte: startDate },
            status: { $in: ['evaluated', 'human_reviewed'] }
        }),
        Company.countDocuments({
            status: 'active',
            updatedAt: { $gte: startDate }
        })
    ]);

    return {
        totalCompanies,
        totalUsers,
        totalResumes,
        totalEvaluations,
        activeCompanies,
        processingSuccessRate: totalEvaluations > 0 ?
            Math.round((totalEvaluations / totalResumes) * 100) : 0
    };
}

async function getSystemTrends(startDate) {
    const dailyTrends = await Resume.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                resumes: { $sum: 1 },
                evaluations: {
                    $sum: { $cond: [{ $in: ['$status', ['evaluated', 'human_reviewed']] }, 1, 0] }
                },
                avgScore: { $avg: '$aiEvaluation.totalScore' }
            }
        },
        {
            $sort: { '_id': 1 }
        }
    ]);

    return dailyTrends;
}

async function getPerformanceMetrics(startDate) {
    const metrics = await Resume.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: { $in: ['evaluated', 'human_reviewed'] }
            }
        },
        {
            $group: {
                _id: null,
                avgProcessingTime: { $avg: '$processingTime' },
                avgAiScore: { $avg: '$aiEvaluation.totalScore' },
                avgConfidence: { $avg: '$aiEvaluation.confidence' },
                totalOverrides: {
                    $sum: { $cond: ['$humanOverride.isOverridden', 1, 0] }
                },
                avgOverrideTime: { $avg: '$humanOverride.overrideTime' }
            }
        }
    ]);

    return metrics[0] || {};
}

module.exports = router;