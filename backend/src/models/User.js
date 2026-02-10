const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // Account credentials
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },

    // Organization details
    organizationName: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true
    },
    industry: {
        type: String,
        required: [true, 'Industry is required'],
        trim: true
    },
    companySize: {
        type: String,
        required: [true, 'Company size is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    organizationType: {
        type: String,
        required: [true, 'Organization type is required'],
        trim: true
    },

    // Personal information
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    linkedinProfile: {
        type: String,
        trim: true
    },

    // Professional information
    jobTitle: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },

    // Role and permissions
    role: {
        type: String,
        enum: ['Admin', 'HR Manager', 'Recruiter', 'Viewer'],
        default: 'Recruiter'
    },

    // Compliance and consent
    complianceAccepted: {
        aiAcknowledgment: { type: Boolean, default: false },
        humanLoopUnderstanding: { type: Boolean, default: false },
        auditLoggingAcceptance: { type: Boolean, default: false },
        dataProcessingAcceptance: { type: Boolean, default: false }
    },

    // Legacy fields for backward compatibility
    personalInfo: {
        firstName: String,
        lastName: String,
        phone: String,
        department: String,
        position: String,
        location: String,
        bio: String
    },
    professionalInfo: {
        joinDate: { type: Date, default: Date.now },
        totalEvaluations: { type: Number, default: 0 },
        successfulPlacements: { type: Number, default: 0 },
        averageTimeToHire: Number,
        specializations: [String],
        certifications: [String],
        languages: [String]
    },
    performance: {
        quarterlyScore: { type: Number, default: 0 },
        candidateSatisfaction: { type: Number, default: 0 },
        hiringManagerRating: { type: Number, default: 0 },
        efficiencyScore: { type: Number, default: 0 },
        qualityScore: { type: Number, default: 0 },
        trend: { type: String, default: 'stable' }
    },

    // Status fields
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
