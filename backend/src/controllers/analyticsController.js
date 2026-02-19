const Resume = require('../models/Resume');
const Evaluation = require('../models/Evaluation');
const HiringForm = require('../models/HiringForm');
const User = require('../models/User');
const Company = require('../models/Company');
const logger = require('../utils/logger');

// Get Cost Analytics
exports.getCostAnalytics = async (req, res) => {
    try {
        const costStats = await Evaluation.aggregate([
            {
                $group: {
                    _id: null,
                    totalTokens: { $sum: "$cost.tokensUsed" },
                    totalCost: { $sum: "$cost.estimatedCost" },
                    count: { $sum: 1 },
                    avgCost: { $avg: "$cost.estimatedCost" }
                }
            }
        ]);

        const monthlyStats = await Evaluation.aggregate([
            {
                $group: {
                    _id: { $month: "$evaluatedAt" },
                    tokens: { $sum: "$cost.tokensUsed" },
                    cost: { $sum: "$cost.estimatedCost" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const promptStats = await Evaluation.aggregate([
            {
                $group: {
                    _id: "$promptId",
                    count: { $sum: 1 },
                    cost: { $sum: "$cost.estimatedCost" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "prompts",
                    localField: "_id",
                    foreignField: "_id",
                    as: "prompt"
                }
            },
            { $unwind: "$prompt" },
            {
                $project: {
                    name: "$prompt.name",
                    count: 1,
                    cost: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total: costStats[0] || { totalTokens: 0, totalCost: 0, count: 0, avgCost: 0 },
                monthly: monthlyStats,
                topPrompts: promptStats
            }
        });

    } catch (error) {
        console.error('Cost Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getSystemStats = async (req, res) => {
    try {
        // Aggregate Disqualification Rates by Industry (derived from Prompt/Resume data if available)
        // Since Industry is on HiringForm/Prompt, we might fallback to simple mock grouping or just total stats for now 
        // as Resume doesn't strictly store 'Industry' directly unless we populate from a linked Job/Form (which we don't strictly have a link to yet in this simple schema).

        // However, we can aggregate by 'role' or just show overall stats.
        // For the purpose of this advanced demo, we will compute stats based on the available data.

        const totalCandidates = await Resume.countDocuments();
        const disqualifiedCandidates = await Resume.countDocuments({ status: 'Disqualified' });
        const hiredCandidates = await Resume.countDocuments({ status: 'Hired' });

        const disagreementCount = await Resume.countDocuments({ disagreementSignal: true });

        // Aggregation for Industry Stats
        const industryStats = await Resume.aggregate([
            {
                $group: {
                    _id: "$industry",
                    total: { $sum: 1 },
                    disqualified: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Disqualified"] }, 1, 0]
                        }
                    },
                    disagreementCount: {
                        $sum: {
                            $cond: [{ $eq: ["$disagreementSignal", true] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    industry: { $ifNull: ["$_id", "Unknown"] },
                    total: 1,
                    disqualified: 1,
                    disagreementRate: {
                        $round: [
                            {
                                $cond: [
                                    { $gt: ["$total", 0] },
                                    { $multiply: [{ $divide: ["$disagreementCount", "$total"] }, 100] },
                                    0
                                ]
                            },
                            1
                        ]
                    }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Monthly trends
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        const trends = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    resumes: { $sum: 1 },
                    evaluations: {
                        $sum: { $cond: [{ $in: ["$status", ["evaluated", "human_reviewed"]] }, 1, 0] }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                metrics: {
                    totalCompanies,
                    totalUsers,
                    resumesProcessed: totalCandidates,
                    evaluationsCount: hiredCandidates + disqualifiedCandidates, // simplified for demo
                    humanOverrides: disagreementCount,
                    failedEvaluations: 0 // Mock failed for now
                },
                trends: trends.map(t => ({
                    date: t._id,
                    resumes: t.resumes,
                    evaluations: t.evaluations
                })),
                performance: {
                    industryStats
                },
                totalCandidates,
                disqualificationRate: totalCandidates ? ((disqualifiedCandidates / totalCandidates) * 100).toFixed(1) : 0,
                hiredCount: hiredCandidates,
                disagreementCount,
                industryStats
            }
        });

    } catch (error) {
        console.error('Error fetching system stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
};
exports.getFairnessStats = exports.getSystemStats;

// Get resume processing metrics
exports.getResumeProcessingMetrics = async (req, res) => {
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
                        $sum: { $cond: [{ $ifNull: ['$processingError', false] }, 1, 0] }
                    },
                    avgProcessingTime: { $avg: '$processingTime' },
                    byStatus: { $push: '$status' },
                    byFileType: { $push: '$fileType' }
                }
            }
        ]);

        const result = metrics[0] || {
            totalResumes: 0,
            processedResumes: 0,
            failedResumes: 0,
            avgProcessingTime: 0,
            byStatus: [],
            byFileType: []
        };

        // Format byStatus and byFileType into counts
        const statusCounts = result.byStatus.reduce((acc, status) => {
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const fileTypeCounts = result.byFileType.reduce((acc, type) => {
            acc[type || 'Unknown'] = (acc[type || 'Unknown'] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                totalResumes: result.totalResumes,
                processedResumes: result.processedResumes,
                failedResumes: result.failedResumes,
                avgProcessingTime: result.avgProcessingTime || 0,
                successRate: result.totalResumes > 0 ? (result.processedResumes / result.totalResumes) * 100 : 0,
                byStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
                byFileType: Object.entries(fileTypeCounts).map(([type, count]) => ({ type, count })),
                dateRange
            }
        });
    } catch (error) {
        console.error('Error fetching resume processing metrics:', error);
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};

// Get AI model usage analytics
exports.getAIUsageAnalytics = async (req, res) => {
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
            { $match: matchQuery },
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
            { $sort: { '_id.date': 1, '_id.model': 1 } }
        ]);

        const distribution = await Resume.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$aiEvaluation.model',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$aiEvaluation.totalScore' },
                    avgConfidence: { $avg: '$aiEvaluation.confidence' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                usage: usage.map(u => ({
                    date: u._id.date,
                    model: u._id.model,
                    calls: u.count,
                    avgScore: Math.round(u.avgScore || 0),
                    avgConfidence: Math.round(u.avgConfidence || 0),
                    avgTime: Math.round(u.avgTime || 0)
                })),
                distribution: distribution.map(d => ({
                    model: d._id || 'Unknown',
                    calls: d.count,
                    avgScore: Math.round(d.avgScore || 0),
                    avgConfidence: Math.round(d.avgConfidence || 0)
                })),
                totalCalls: distribution.reduce((sum, d) => sum + d.count, 0),
                dateRange
            }
        });
    } catch (error) {
        console.error('Error fetching AI usage analytics:', error);
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};

// Get evaluation quality metrics
exports.getEvaluationQualityMetrics = async (req, res) => {
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
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                    },
                    overrides: { $sum: { $cond: ['$humanOverride.isOverridden', 1, 0] } },
                    avgAiScore: { $avg: '$aiEvaluation.totalScore' },
                    avgOverrideScore: { $avg: '$humanOverride.finalScore' }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                quality: quality[0] ? {
                    totalEvaluations: quality[0].totalEvaluations,
                    avgAiScore: Math.round(quality[0].avgAiScore || 0),
                    avgConfidence: Math.round(quality[0].avgConfidence || 0),
                    totalOverrides: quality[0].totalOverrides,
                    avgOverrideTime: Math.round(quality[0].avgOverrideTime || 0),
                    avgOverrideScore: Math.round(quality[0].avgOverrideScore || 0)
                } : {},
                overrideTrends: trends.map(t => ({
                    date: t._id.date,
                    overrides: t.overrides,
                    avgAiScore: Math.round(t.avgAiScore || 0),
                    avgOverrideScore: Math.round(t.avgOverrideScore || 0)
                })),
                dateRange
            }
        });
    } catch (error) {
        console.error('Error fetching quality metrics:', error);
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};

// Get recruiter override patterns
exports.getRecruiterPatterns = async (req, res) => {
    try {
        const { dateRange = '30d', companyId } = req.query;
        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const matchQuery = {
            createdAt: { $gte: startDate },
            'humanOverride.isOverridden': true
        };
        if (companyId) matchQuery.company = companyId;

        const patterns = await Resume.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$uploadedBy',
                    overrideCount: { $sum: 1 },
                    avgOverrideTime: { $avg: '$humanOverride.overrideTime' },
                    avgAiScore: { $avg: '$aiEvaluation.totalScore' },
                    avgOverrideScore: { $avg: '$humanOverride.finalScore' }
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
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'user.company',
                    foreignField: '_id',
                    as: 'company'
                }
            },
            { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
            { $sort: { overrideCount: -1 } },
            { $limit: 20 }
        ]);

        res.json({
            success: true,
            data: patterns.map(p => ({
                recruiter: `${p.user.firstName} ${p.user.lastName}`,
                company: p.company?.name || 'Unknown',
                overrides: p.overrideCount,
                avgOverrideTime: Math.round(p.avgOverrideTime || 0),
                avgAiScore: Math.round(p.avgAiScore || 0),
                avgOverrideScore: Math.round(p.avgOverrideScore || 0)
            })),
            dateRange
        });
    } catch (error) {
        console.error('Error fetching recruiter patterns:', error);
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};

// Get industry-wise evaluation distribution
exports.getIndustryDistribution = async (req, res) => {
    try {
        const { dateRange = '30d' } = req.query;
        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const distribution = await Resume.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
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
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: distribution.map(d => ({
                industry: d._id || 'Unknown',
                count: d.count,
                avgScore: Math.round(d.avgScore || 0),
                overrideRate: Math.round((d.overrideRate || 0) * 100)
            })),
            dateRange
        });
    } catch (error) {
        console.error('Error fetching industry distribution:', error);
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};

// Get list of evaluations for oversight
exports.getEvaluationsList = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            industry,
            roleType,
            isOverridden,
            searchTerm
        } = req.query;

        const query = {};
        if (industry && industry !== 'all') query.industry = industry;
        if (roleType && roleType !== 'all') query.roleType = roleType;
        if (isOverridden === 'true') query['humanOverride.isOverridden'] = true;
        if (isOverridden === 'false') query['humanOverride.isOverridden'] = false;

        if (searchTerm) {
            query.$or = [
                { candidateName: { $regex: searchTerm, $options: 'i' } },
                { candidateEmail: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const evaluations = await Resume.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('uploadedBy', 'firstName lastName email')
            .lean();

        const total = await Resume.countDocuments(query);

        res.json({
            success: true,
            data: evaluations.map(e => ({
                id: e._id,
                candidateName: e.candidateName,
                email: e.candidateEmail,
                company: { name: 'System' },
                industry: e.industry || 'Unknown',
                roleType: e.roleType || 'Unknown',
                aiScore: e.aiEvaluation?.totalScore || 0,
                aiConfidence: e.aiEvaluation?.confidence || 0,
                humanScore: e.humanOverride?.finalScore || null,
                isOverridden: e.humanOverride?.isOverridden || false,
                overrideReason: e.humanOverride?.reason || null,
                overrideTime: e.humanOverride?.overrideTime || null,
                flags: e.flags || [],
                createdAt: e.createdAt,
                processingTime: e.processingTime || 0,
                aiModel: e.aiEvaluation?.model || 'Unknown'
            })),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching evaluations list:', error);
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};

exports.getFairnessStats = exports.getSystemStats;

exports.getEmployerDashboardStats = async (req, res) => {
    try {
        // 1. KPI Cards
        const totalResumes = await Resume.countDocuments();
        const totalEvaluations = await Evaluation.countDocuments();

        // Avg Score
        const scoreAgg = await Evaluation.aggregate([
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: "$result.totalScore" }
                }
            }
        ]);
        const avgMatchScore = scoreAgg[0] ? Math.round(scoreAgg[0].avgScore) : 0;

        const activeOpenings = await HiringForm.countDocuments({ status: 'Open' });

        // 2. Recruitment Velocity (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of month

        const velocityAgg = await Evaluation.aggregate([
            {
                $match: {
                    evaluatedAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$evaluatedAt" },
                        year: { $year: "$evaluatedAt" }
                    },
                    evaluations: { $sum: 1 },
                    avgAccuracy: { $avg: "$result.confidence" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const chartData = velocityAgg.map(item => {
            const date = new Date(item._id.year, item._id.month - 1);
            return {
                month: date.toLocaleString('default', { month: 'short' }),
                evaluations: item.evaluations,
                accuracy: Math.round(item.avgAccuracy || 0)
            };
        });

        // 3. Sector Distribution (Industry)
        const industryAgg = await Resume.aggregate([
            {
                $group: {
                    _id: "$industry",
                    value: { $sum: 1 }
                }
            },
            { $sort: { value: -1 } },
            { $limit: 4 }
        ]);

        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const industryData = industryAgg.map((item, index) => ({
            name: item._id || 'Unspecified',
            value: item.value,
            color: colors[index % colors.length]
        }));


        // 4. Recent Activity
        const recentEvaluations = await Evaluation.find()
            .sort({ evaluatedAt: -1 })
            .limit(5)
            .populate('resumeId', 'candidateName roleType status')
            .lean();

        const recentActivity = recentEvaluations.map(ev => {
            // Calculate time ago
            const diff = Date.now() - new Date(ev.evaluatedAt).getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const timeStr = hours < 1 ? 'Just now' : hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;

            return {
                id: ev._id,
                candidate: ev.resumeId?.candidateName || 'Unknown Candidate',
                position: ev.resumeId?.roleType || 'Unknown Position',
                score: ev.result?.totalScore || 0,
                status: ev.resumeId?.status || 'Pending',
                time: timeStr
            };
        });

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalResumes,
                    totalEvaluations,
                    avgMatchScore,
                    activeOpenings
                },
                chartData,
                industryData,
                recentActivity
            }
        });

    } catch (error) {
        console.error('Error fetching employer dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
