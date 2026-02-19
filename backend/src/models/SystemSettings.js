const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    general: {
        fileUpload: {
            maxFileSize: { type: Number, default: 10485760 },
            allowedTypes: { type: [String], default: ['pdf', 'doc', 'docx', 'txt'] },
            maxFilesPerUpload: { type: Number, default: 10 }
        },
        aiProviders: {
            openai: { enabled: { type: Boolean, default: true }, rateLimit: { type: Number, default: 1000 } },
            anthropic: { enabled: { type: Boolean, default: true }, rateLimit: { type: Number, default: 500 } },
            google: { enabled: { type: Boolean, default: true }, rateLimit: { type: Number, default: 200 } }
        },
        rateLimits: {
            resumeUpload: { windowMs: { type: Number, default: 900000 }, max: { type: Number, default: 100 } },
            evaluation: { windowMs: { type: Number, default: 60000 }, max: { type: Number, default: 50 } },
            api: { windowMs: { type: Number, default: 900000 }, max: { type: Number, default: 1000 } }
        }
    },
    features: {
        customPrompts: { type: Boolean, default: true },
        advancedAnalytics: { type: Boolean, default: true },
        apiAccess: { type: Boolean, default: true },
        bulkImport: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        auditLogging: { type: Boolean, default: true }
    },
    maintenance: {
        mode: { type: Boolean, default: false },
        message: { type: String, default: 'System is undergoing maintenance. Please try again later.' },
        scheduled: { type: Date, default: null }
    },
    security: {
        passwordPolicy: {
            minLength: { type: Number, default: 8 },
            requireUppercase: { type: Boolean, default: true },
            requireLowercase: { type: Boolean, default: true },
            requireNumbers: { type: Boolean, default: true },
            requireSpecialChars: { type: Boolean, default: true }
        },
        sessionTimeout: { type: Number, default: 3600000 },
        twoFactorAuth: { type: Boolean, default: true },
        ipWhitelist: { type: [String], default: [] }
    },
    notifications: {
        emailAlerts: { type: Boolean, default: true },
        criticalAlerts: { type: Boolean, default: true },
        aiProviderFailures: { type: Boolean, default: true },
        queueBacklog: { type: Boolean, default: true },
        highOverrideRates: { type: Boolean, default: true },
        securityEvents: { type: Boolean, default: true }
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
