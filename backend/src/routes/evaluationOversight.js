const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get all evaluations across companies (Master Admin and Ops Admin)
router.get('/', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            companyId, 
            industry, 
            roleType, 
            aiScoreRange, 
            humanOverride, 
            dateFrom, 
            dateTo,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};
        
        // Filter by company (Master admin can see all, Ops admin can see all)
        if (companyId) {
            query['company'] = companyId;
        }

        // Filter by industry
        if (industry) {
            query['industry'] = industry;
        }

        // Filter by role type
        if (roleType) {
            query['roleType'] = roleType;
        }

        // Filter by AI score range
        if (aiScoreRange) {
            const [min, max] = aiScoreRange.split('-').map(Number);
            query['aiEvaluation.totalScore'] = { $gte: min, $lte: max };
        }

        // Filter by human override
        if (humanOverride !== undefined) {
            query['humanOverride.isOverridden'] = humanOverride === 'true';
        }

        // Filter by date range
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        // Add evaluation status filter
        query.status = { $in: ['evaluated', 'human_reviewed'] };

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const evaluations = await Resume.find(query)
            .populate('company', 'name industry')
            .populate('uploadedBy', 'email firstName lastName')
            .populate('aiEvaluation.promptVersion', 'name version')
            .select('-resumeContent -parsedContent -fileUrl')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Resume.countDocuments(query);

        // Get summary statistics
        const summary = await getEvaluationSummary(query);

        res.json({
            success: true,
            data: evaluations,
            summary,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('Error fetching evaluations:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get evaluation details with full AI reasoning
router.get('/:id', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const evaluation = await Resume.findById(req.params.id)
            .populate('company', 'name industry')
            .populate('uploadedBy', 'email firstName lastName')
            .populate('aiEvaluation.promptVersion', 'name version')
            .populate('humanOverride.overriddenBy', 'email firstName lastName');

        if (!evaluation) {
            return res.status(404).json({
                success: false,
                error: { message: 'Evaluation not found' }
            });
        }

        res.json({
            success: true,
            data: evaluation
        });
    } catch (error) {
        logger.error('Error fetching evaluation details:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Flag suspicious evaluation
router.post('/:id/flag', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { reason, severity = 'medium' } = req.body;

        const evaluation = await Resume.findById(req.params.id);
        if (!evaluation) {
            return res.status(404).json({
                success: false,
                error: { message: 'Evaluation not found' }
            });
        }

        // Add flag to evaluation
        evaluation.flags.push({
            reason,
            severity,
            flaggedBy: req.user._id,
            flaggedAt: new Date()
        });

        await evaluation.save();

        logger.info(`Evaluation flagged: ${evaluation._id} by ${req.user.email} - ${reason}`);
        
        res.json({
            success: true,
            message: 'Evaluation flagged successfully',
            data: evaluation
        });
    } catch (error) {
        logger.error('Error flagging evaluation:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Remove flag from evaluation
router.delete('/:id/flag/:flagId', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const evaluation = await Resume.findById(req.params.id);
        if (!evaluation) {
            return res.status(404).json({
                success: false,
                error: { message: 'Evaluation not found' }
            });
        }

        const flagIndex = evaluation.flags.findIndex(flag => flag._id.toString() === req.params.flagId);
        if (flagIndex === -1) {
            return res.status(404).json({
                success: false,
                error: { message: 'Flag not found' }
            });
        }

        evaluation.flags.splice(flagIndex, 1);
        await evaluation.save();

        logger.info(`Evaluation flag removed: ${evaluation._id} by ${req.user.email}`);
        
        res.json({
            success: true,
            message: 'Flag removed successfully',
            data: evaluation
        });
    } catch (error) {
        logger.error('Error removing evaluation flag:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get evaluation statistics and trends
router.get('/stats/overview', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { dateRange = '30d' } = req.query;
        
        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get basic statistics
        const stats = await Resume.aggregate([
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
                    avgHumanScore: { $avg: '$humanOverride.finalScore' },
                    totalOverrides: { $sum: { $cond: ['$humanOverride.isOverridden', 1, 0] } },
                    avgOverrideTime: { $avg: '$humanOverride.overrideTime' },
                    byIndustry: {
                        $push: '$industry'
                    },
                    byRoleType: {
                        $push: '$roleType'
                    }
                }
            }
        ]);

        // Get daily trends
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
                        industry: '$industry'
                    },
                    count: { $sum: 1 },
                    avgScore: { $avg: '$aiEvaluation.totalScore' },
                    overrideRate: {
                        $avg: { $cond: ['$humanOverride.isOverridden', 1, 0] }
                    }
                }
            },
            {
                $sort: { '_id.date': 1 }
            }
        ]);

        // Get industry distribution
        const industryDistribution = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $in: ['evaluated', 'human_reviewed'] }
                }
            },
            {
                $group: {
                    _id: '$industry',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$aiEvaluation.totalScore' },
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
                overview: stats[0] || {},
                trends,
                industryDistribution
            }
        });
    } catch (error) {
        logger.error('Error fetching evaluation stats:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get AI vs Human decision comparison
router.get('/stats/comparison', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { dateRange = '30d', industry, roleType } = req.query;
        
        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const matchQuery = {
            createdAt: { $gte: startDate },
            status: { $in: ['evaluated', 'human_reviewed'] }
        };

        if (industry) matchQuery.industry = industry;
        if (roleType) matchQuery.roleType = roleType;

        const comparison = await Resume.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: '$humanOverride.isOverridden',
                            then: 'Human Override',
                            else: 'AI Decision'
                        }
                    },
                    count: { $sum: 1 },
                    avgAiScore: { $avg: '$aiEvaluation.totalScore' },
                    avgHumanScore: { $avg: '$humanOverride.finalScore' },
                    avgConfidence: { $avg: '$aiEvaluation.confidence' }
                }
            }
        ]);

        // Get score distribution
        const scoreDistribution = await Resume.aggregate([
            {
                $match: matchQuery
            },
            {
                $bucket: {
                    groupBy: '$aiEvaluation.totalScore',
                    boundaries: [0, 20, 40, 60, 80, 100],
                    default: 100,
                    output: {
                        count: { $sum: 1 },
                        overrides: {
                            $sum: { $cond: ['$humanOverride.isOverridden', 1, 0] }
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                comparison,
                scoreDistribution
            }
        });
    } catch (error) {
        logger.error('Error fetching comparison stats:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Helper function to get evaluation summary
async function getEvaluationSummary(query) {
    const summary = await Resume.aggregate([
        {
            $match: query
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                avgAiScore: { $avg: '$aiEvaluation.totalScore' },
                totalOverrides: {
                    $sum: { $cond: ['$humanOverride.isOverridden', 1, 0] }
                },
                avgOverrideTime: { $avg: '$humanOverride.overrideTime' },
                flaggedCount: {
                    $sum: { $size: '$flags' }
                }
            }
        }
    ]);

    return summary[0] || {
        total: 0,
        avgAiScore: 0,
        totalOverrides: 0,
        avgOverrideTime: 0,
        flaggedCount: 0
    };
}

module.exports = router;