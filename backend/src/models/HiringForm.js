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

    // Standard Fields Configuration (Toggleable)
    standardFields: {
        linkedIn: { type: Boolean, default: false },
        portfolio: { type: Boolean, default: false },
        github: { type: Boolean, default: false },
        expectedSalary: { type: Boolean, default: false },
        currentSalary: { type: Boolean, default: false },
        noticePeriod: { type: Boolean, default: false },
        experienceYears: { type: Boolean, default: false },
        currentCompany: { type: Boolean, default: false },
        currentDesignation: { type: Boolean, default: false },
        workMode: { type: Boolean, default: false }, // Remote, Onsite, Hybrid
        relocate: { type: Boolean, default: false }
    },

    // Custom Application Form Fields
    applyFormFields: [{
        id: { type: String, required: true }, // unique identifier for the field
        type: {
            type: String,
            required: true,
            enum: ['text', 'textarea', 'select', 'checkbox', 'radio', 'number', 'date', 'url', 'email', 'file', 'yesno']
        },
        label: { type: String, required: true },
        placeholder: { type: String },
        required: { type: Boolean, default: false },
        options: [{ type: String }], // For select, radio, checkbox
        validation: {
            min: Number,
            max: Number,
            regex: String,
            fileType: [String], // for file uploads (e.g., ['pdf', 'png'])
            maxFileSize: Number // in MB
        },
        aiRelevant: { type: Boolean, default: false }, // If true, passed to AI for analysis
        section: { type: String, default: 'General' }, // Grouping fields
        order: { type: Number, default: 0 }, // For drag and drop ordering

        // Conditional Logic
        showIf: {
            fieldId: String, // ID of the field to check against
            value: mongoose.Schema.Types.Mixed, // Value that triggers visibility
            operator: { type: String, enum: ['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan'], default: 'equals' }
        }
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
