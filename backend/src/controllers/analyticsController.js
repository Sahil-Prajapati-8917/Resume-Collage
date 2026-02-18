const Resume = require('../models/Resume');
const Evaluation = require('../models/Evaluation');

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

        return res.status(200).json({
            success: true,
            data: {
                totalCandidates,
                disqualificationRate: totalCandidates ? ((disqualifiedCandidates / totalCandidates) * 100).toFixed(1) : 0,
                hiredCount: hiredCandidates,
                disagreementCount,
                industryStats
            }
        });

    } catch (error) {
        console.error('Error fetching fairness stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
};
exports.getFairnessStats = exports.getSystemStats;

const HiringForm = require('../models/HiringForm');

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
