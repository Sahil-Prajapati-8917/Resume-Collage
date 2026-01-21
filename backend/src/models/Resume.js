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
    }
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;