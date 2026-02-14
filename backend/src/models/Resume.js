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
        matchedSkills: [{ type: String }],
        missingSkills: [{ type: String }],
        candidateSkills: [{ type: String }],
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
    // Trust & Integrity Layer
    qualityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    integritySignals: [{
        type: { type: String }, // e.g., 'Buzzwords', 'Timeline Gap'
        severity: { type: String, enum: ['Low', 'Medium', 'High'] },
        description: { type: String }
    }],
    disagreementSignal: {
        type: Boolean,
        default: false
    },
    hiringOutcome: {
        type: String,
        enum: ['Pending', 'Hired', 'Rejected'],
        default: 'Pending'
    },
    // Evaluation Status
    status: {
        type: String,
        enum: ['Pending', 'Under Process', 'Shortlisted', 'Disqualified', 'Manual Review Required', 'Hired', 'Rejected'],
        default: 'Pending'
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
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Kept for backward compatibility or HR uploads

    // Link to Job Opening
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HiringForm'
    },
    // Candidate Details
    candidateName: { type: String, trim: true },
    candidateEmail: { type: String, trim: true, lowercase: true },
    candidatePhone: { type: String, trim: true },
    resumeUrl: { type: String }, // URL to file storage if moved to cloud later

    // Standard Fields Data
    linkedIn: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    github: { type: String, trim: true },
    expectedSalary: { type: String, trim: true },
    currentSalary: { type: String, trim: true },
    noticePeriod: { type: String, trim: true },
    experienceYears: { type: String, trim: true },
    currentCompany: { type: String, trim: true },
    currentDesignation: { type: String, trim: true },
    workMode: { type: String, trim: true },
    relocate: { type: Boolean },

    // Dynamic Form Data (Custom Fields)
    formData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;