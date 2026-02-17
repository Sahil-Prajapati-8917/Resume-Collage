const Evaluation = require('../models/Evaluation');
const Resume = require('../models/Resume');
const HiringForm = require('../models/HiringForm');
const AuditLog = require('../models/AuditLog');
const { evaluationQueue } = require('../config/queue');

// @desc    Start Bulk Evaluation
// @route   POST /api/evaluation/bulk
// @access  Private (HR)
exports.startBulkEvaluation = async (req, res) => {
    try {
        const { jobId, promptId, candidateIds } = req.body;
        const userId = req.user?._id; // Assuming auth middleware

        if (!jobId || !promptId) {
            return res.status(400).json({ success: false, message: 'Job ID and Prompt ID are required' });
        }

        // 1. Identify Candidates
        let query = { jobId: jobId };
        if (candidateIds && candidateIds.length > 0) {
            query._id = { $in: candidateIds };
        } else {
            // Default: Evaluations for pending/processing, or all?
            // Let's filter out 'Hired' or 'Rejected' if we don't want to re-eval them?
            // For now, let's process ALL matching the job to be safe/thorough unless filtered by UI.
        }

        const resumes = await Resume.find(query).select('_id');

        if (resumes.length === 0) {
            return res.status(404).json({ success: false, message: 'No candidates found for this job' });
        }

        // 2. Add to Queue
        const jobs = resumes.map(resume => ({
            resumeId: resume._id,
            jobId,
            promptId,
            userId
        }));

        // Bulk add to Bull queue
        const opts = { attempts: 3 };
        jobs.forEach(data => evaluationQueue.add(data, opts));

        // 3. Log Audit
        await AuditLog.create({
            action: 'BULK_EVALUATION',
            performedBy: userId,
            targetId: jobId,
            targetModel: 'HiringForm',
            details: { count: jobs.length, promptId }
        });

        res.status(200).json({
            success: true,
            message: `Started evaluation for ${jobs.length} candidates`,
            data: {
                total: jobs.length,
                jobId
            }
        });

    } catch (error) {
        console.error('Bulk Evaluation Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get Evaluation Progress for a Job
// @route   GET /api/evaluation/progress/:jobId
// @access  Private
exports.getJobProgress = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Count total resumes for this job
        const totalResumes = await Resume.countDocuments({ jobId });

        // Count evaluations linked to this job that are recent (e.g. last 24h? or just all?)
        // Better: Count by status in Evaluation model
        // Actually, for specific "bulk run" progress, we might need a batch ID. 
        // But for simplicity, we can just show "Processed vs Total" for the Job context.

        const completed = await Evaluation.countDocuments({ jobId, status: 'Completed' });
        const failed = await Evaluation.countDocuments({ jobId, status: 'Failed' });
        const processing = await Evaluation.countDocuments({ jobId, status: 'Processing' }); // If we update status to processing

        // Bull queue counts (approximate)
        // const active = await evaluationQueue.getJobCounts(); 
        // But that's global.

        res.status(200).json({
            success: true,
            data: {
                total: totalResumes,
                completed,
                failed,
                pending: totalResumes - (completed + failed) // Approx
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Evaluation Results with Filtering
// @route   GET /api/evaluation/results/:jobId
// @access  Private
exports.getEvaluationResults = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { sort, status, minScore } = req.query;

        let query = { jobId, status: 'Completed' };
        if (status) query['result.riskFlag'] = status; // Example mapping

        // Sorting logic
        let sortOption = { 'result.totalScore': -1 }; // Default desc score
        if (sort === 'date_asc') sortOption = { evaluatedAt: 1 };

        const evaluations = await Evaluation.find(query)
            .populate('resumeId', 'fileName candidateName candidateEmail')
            .sort(sortOption)
            .limit(100);

        res.status(200).json({
            success: true,
            count: evaluations.length,
            data: evaluations
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Evaluate All Pending Resumes in Queue
// @route   POST /api/evaluation/queue/all
// @access  Private (HR)
exports.evaluateAllQueued = async (req, res) => {
    try {
        const userId = req.user?._id;

        // Find all resumes that are Pending and have a jobId
        const resumes = await Resume.find({
            status: 'Pending',
            jobId: { $exists: true }
        }).populate('jobId');

        if (resumes.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No pending applications found in the queue',
                count: 0
            });
        }

        let queuedCount = 0;
        const opts = { attempts: 3 };

        for (const resume of resumes) {
            // Check if job exists and has a prompt
            if (resume.jobId && resume.jobId.promptId) {
                await evaluationQueue.add({
                    resumeId: resume._id,
                    jobId: resume.jobId._id,
                    promptId: resume.jobId.promptId,
                    userId
                }, opts);

                // Update status to 'Under Process' immediately to prevent double-queuing
                resume.status = 'Under Process';
                await resume.save();

                queuedCount++;
            }
        }

        // Log Audit
        if (AuditLog) {
            await AuditLog.create({
                action: 'QUEUE_EVALUATION_START',
                performedBy: userId,
                details: { count: queuedCount }
            });
        }

        res.status(200).json({
            success: true,
            message: `Successfully queued ${queuedCount} applications for evaluation`,
            data: {
                total: resumes.length,
                queued: queuedCount
            }
        });

    } catch (error) {
        console.error('Queue Evaluation Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
