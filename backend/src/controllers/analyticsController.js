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
