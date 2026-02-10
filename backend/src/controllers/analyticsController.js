const Resume = require('../models/Resume');

exports.getFairnessStats = async (req, res) => {
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

        // Mocking Industry Breakdowns for the dashboard visualization since we don't have strictly linked Job IDs on resumes in this MVP setup
        const industryStats = [
            { industry: 'Tech', total: 45, disqualified: 12, disagreementRate: 5 },
            { industry: 'Finance', total: 30, disqualified: 8, disagreementRate: 2 },
            { industry: 'Healthcare', total: 25, disqualified: 3, disagreementRate: 0 },
        ];

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
