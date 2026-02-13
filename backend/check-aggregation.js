const mongoose = require('mongoose');

// Mock Resume model for syntax check
const Resume = {
    aggregate: (pipeline) => {
        console.log("Pipeline syntax is valid array:", Array.isArray(pipeline));
        console.log("Pipeline stages:", pipeline.length);
        return Promise.resolve([]);
    }
};

async function testAggregation() {
    try {
        console.log("Testing aggregation pipeline syntax...");
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
        console.log("Aggregation logic check passed.");
    } catch (error) {
        console.error("Syntax error:", error);
    }
}

testAggregation();
