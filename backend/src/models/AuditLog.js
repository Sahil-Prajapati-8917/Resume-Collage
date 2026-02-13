const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['BULK_EVALUATION', 'SINGLE_EVALUATION', 'STATUS_CHANGE', 'OVERRIDE', 'RESUME_UPLOAD', 'JOB_CREATED']
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // System actions might be null or specific system user
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId, // Could be jobId, resumeId, etc.
        required: true
    },
    targetModel: {
        type: String, // 'HiringForm', 'Resume', 'Evaluation'
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: { type: String },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
