const mongoose = require('mongoose');

const HiringFormSchema = new mongoose.Schema({
    formName: {
        type: String,
        required: [true, 'Form name is required'],
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    industry: {
        type: String,
        required: [true, 'Industry is required'],
        trim: true
    },
    promptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prompt',
        required: [true, 'Prompt selection is required']
    },
    experienceLevel: {
        type: String,
        required: [true, 'Experience level is required'],
        trim: true
    },
    jobType: {
        type: String,
        required: [true, 'Job type is required'],
        enum: ['full-time', 'internship', 'placement']
    },
    responsibilities: [{
        type: String,
        trim: true
    }],
    requirements: [{
        type: String,
        trim: true
    }],
    roleExpectations: [{
        type: String,
        trim: true
    }],
    performanceIndicators: [{
        type: String,
        trim: true
    }],

    // Phase 2: Smart Automation Rules
    cutOffSettings: {
        autoShortlist: { type: Number, default: 85 },
        manualReview: { type: Number, default: 65 },
        autoReject: { type: Number, default: 60 }
    },

    version: {
        type: Number,
        default: 1
    },
    isLocked: {
        type: Boolean,
        default: false // Becomes true after creation to lock Industry
    },
    editHistory: [{
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now },
        changes: { type: mongoose.Schema.Types.Mixed }
    }],
    description: {
        type: String,
        required: [true, 'Job description is required'],
        trim: true
    },
    deadline: {
        type: Date,
        required: [true, 'Application deadline is required']
    },
    status: {
        type: String,
        enum: ['Open', 'Closed', 'Draft'],
        default: 'Open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('HiringForm', HiringFormSchema);
