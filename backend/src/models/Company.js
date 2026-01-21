const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        unique: true
    },
    industry: {
        type: String,
        required: [true, 'Industry is required'],
        enum: ['IT', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Other']
    },
    companySize: {
        type: String,
        required: [true, 'Company size is required'],
        enum: ['1-10', '11-50', '51-200', '201-1000', '1000+']
    },
    primaryHR: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    subscriptionPlan: {
        type: String,
        enum: ['basic', 'pro', 'enterprise'],
        default: 'basic'
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'inactive'],
        default: 'active'
    },
    settings: {
        maxUsers: { type: Number, default: 10 },
        maxResumesPerMonth: { type: Number, default: 100 },
        aiUsageLimit: { type: Number, default: 1000 },
        features: {
            customPrompts: { type: Boolean, default: false },
            advancedAnalytics: { type: Boolean, default: false },
            apiAccess: { type: Boolean, default: false }
        }
    },
    usage: {
        totalResumes: { type: Number, default: 0 },
        totalEvaluations: { type: Number, default: 0 },
        aiCalls: { type: Number, default: 0 },
        storageUsed: { type: Number, default: 0 } // in MB
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt on save
CompanySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Company', CompanySchema);