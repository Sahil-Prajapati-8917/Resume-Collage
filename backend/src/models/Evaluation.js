const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HiringForm',
        required: true
    },
    promptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prompt',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Skipped'],
        default: 'Pending'
    },
    result: {
        totalScore: { type: Number },
        summary: { type: String },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        matchedSkills: [{ type: String }],
        missingSkills: [{ type: String }],
        candidateSkills: [{ type: String }],

        // Phase 2: Transparency Layer
        transparency: {
            skillMatch: { type: Number }, // 0-100
            experienceMatch: { type: Number }, // 0-100
            domainFit: { type: Number }, // 0-100
            benchmark: { type: String } // e.g. "Top 10%"
        },

        // Phase 2: Risk Detection
        risks: [{
            flag: { type: String }, // e.g. "Unexplained Gap"
            level: { type: String }, // "Low", "Medium", "High"
            details: { type: String }
        }],

        details: { type: mongoose.Schema.Types.Mixed }, // Legacy support
        confidence: { type: Number },
        confidenceLevel: { type: String },
        riskFlag: { type: String } // Overall risk level
    },

    // Phase 2: Cost Monitoring
    cost: {
        tokensUsed: { type: Number, default: 0 },
        estimatedCost: { type: Number, default: 0 }, // in USD
        model: { type: String }
    },

    error: { type: String },
    evaluatedAt: {
        type: Date,
        default: Date.now
    },
    processingTimeMs: { type: Number }
}, {
    timestamps: true
});

// Index for getting all evaluations for a job
evaluationSchema.index({ jobId: 1, createdAt: -1 });

// Index for checking if a resume was already evaluated for this job/prompt
evaluationSchema.index({ resumeId: 1, jobId: 1, promptId: 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
