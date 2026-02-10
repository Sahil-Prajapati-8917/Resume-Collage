const HiringForm = require('../models/HiringForm');
const Resume = require('../models/Resume');

// @desc    Get all applications for queue management
// @route   GET /api/queue/applications
// @access  Private (HR/Admin)
exports.getAllApplications = async (req, res, next) => {
    try {
        // Get all resumes (applications) with job details
        const applications = await Resume.find({})
            .populate('jobId', 'formName title industry')
            .sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error('Error fetching queue applications:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get queue statistics
// @route   GET /api/queue/statistics
// @access  Private (HR/Admin)
exports.getQueueStatistics = async (req, res, next) => {
    try {
        const totalApplications = await Resume.countDocuments();
        const pendingApplications = await Resume.countDocuments({ status: 'Pending' });
        const reviewedApplications = await Resume.countDocuments({ status: 'Reviewed' });
        const shortlistedApplications = await Resume.countDocuments({ status: 'Shortlisted' });
        const rejectedApplications = await Resume.countDocuments({ status: 'Rejected' });
        const activeJobs = await HiringForm.countDocuments({ status: 'Open' });

        // Applications by job
        const applicationsByJob = await Resume.aggregate([
            {
                $group: {
                    _id: '$jobId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'hiringforms',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            {
                $unwind: '$jobDetails'
            },
            {
                $project: {
                    jobId: '$_id',
                    count: 1,
                    formName: '$jobDetails.formName',
                    title: '$jobDetails.title'
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalApplications,
                pendingApplications,
                reviewedApplications,
                shortlistedApplications,
                rejectedApplications,
                activeJobs,
                applicationsByJob
            }
        });
    } catch (error) {
        console.error('Error fetching queue statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update application status
// @route   PUT /api/queue/applications/:id/status
// @access  Private (HR/Admin)
exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['Pending', 'Reviewed', 'Shortlisted', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const application = await Resume.findById(id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        application.status = status;
        if (reason) {
            application.statusReason = reason;
        }

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Add note to application
// @route   POST /api/queue/applications/:id/notes
// @access  Private (HR/Admin)
exports.addApplicationNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (!note || note.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Note content is required'
            });
        }

        const application = await Resume.findById(id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (!application.notes) {
            application.notes = [];
        }

        application.notes.push({
            content: note,
            addedBy: req.user?._id || 'system',
            addedAt: new Date()
        });

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('Error adding application note:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get applications by job ID
// @route   GET /api/queue/applications/job/:jobId
// @access  Private (HR/Admin)
exports.getApplicationsByJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;

        // Verify job exists
        const job = await HiringForm.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const applications = await Resume.find({ jobId })
            .sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error('Error fetching applications by job:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Bulk update application statuses
// @route   PUT /api/queue/applications/bulk-status
// @access  Private (HR/Admin)
exports.bulkUpdateStatus = async (req, res, next) => {
    try {
        const { applicationIds, status, reason } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Application IDs array is required'
            });
        }

        if (!['Pending', 'Reviewed', 'Shortlisted', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const updateData = { status };
        if (reason) {
            updateData.statusReason = reason;
        }

        const result = await Resume.updateMany(
            { _id: { $in: applicationIds } },
            updateData
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} applications updated successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error bulk updating application status:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};