const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: ['recruiter', 'admin', 'manager'],
        default: 'recruiter'
    },
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
