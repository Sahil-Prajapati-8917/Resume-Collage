const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        default: 'anonymous'
    },
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    parsedText: {
        type: String,
        required: true
    },
    isResume: {
        type: Boolean,
        default: true
    },
    anomalies: {
        type: [String],
        default: []
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    // AI Evaluation Data
    aiEvaluation: {
        totalScore: { type: Number },
        summary: { type: String },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        details: { type: mongoose.Schema.Types.Mixed },
        confidence: { type: Number }, // Raw score
        confidenceLevel: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
            default: 'Medium'
        },
        riskFlag: {
            type: String,
            enum: ['None', 'Low', 'Medium', 'High'],
            default: 'None'
        },
        // Reproducibility Metadata
        metadata: {
            model: { type: String },
            promptVersion: { type: String },
            temperature: { type: Number },
            timestamp: { type: Date }
        }
    },
    // Evaluation Status
    status: {
        type: String,
        enum: ['Under Process', 'Shortlisted', 'Disqualified', 'Manual Review Required'],
        default: 'Under Process'
    },
    statusHistory: [{
        status: { type: String, required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
        reason: { type: String } // Mandatory for Disqualified
    }],
    // Human Override Data
    humanOverride: {
        isOverridden: { type: Boolean, default: false },
        finalScore: { type: Number },
        overrideTime: { type: Number }, // Time taken in seconds
        overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String }
    },
    // Flags for suspicious content
    flags: [{
        reason: { type: String },
        severity: { type: String, enum: ['low', 'medium', 'high'] },
        flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        flaggedAt: { type: Date, default: Date.now }
    }],
    industry: { type: String },
    roleType: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;