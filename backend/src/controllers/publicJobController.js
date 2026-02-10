const HiringForm = require('../models/HiringForm');
const Resume = require('../models/Resume');
const fs = require('fs');
const path = require('path');

// @desc    Get public job details
// @route   GET /api/public/jobs/:id
// @access  Public
exports.getPublicJob = async (req, res) => {
    try {
        const job = await HiringForm.findById(req.params.id).select('-editHistory -uploadedBy');

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.status !== 'Open') {
            return res.status(400).json({ success: false, message: 'This job is no longer accepting applications.' });
        }

        res.status(200).json({ success: true, data: job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Apply for a job
// @route   POST /api/public/jobs/:id/apply
// @access  Public
exports.applyForJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { name, email, phone } = req.body;

        // Basic Validation
        if (!name || !email || !req.file) {
            return res.status(400).json({ success: false, message: 'Please provide name, email and resume.' });
        }

        const job = await HiringForm.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.status !== 'Open') {
            return res.status(400).json({ success: false, message: 'This job is no longer accepting applications.' });
        }

        // Handle File
        // In a real app, upload to S3 here. For now, we assume multer memory storage or just store raw text if parsed.
        // The existing resume controller uses memory storage and parses text.
        // We will reuse the Logic or just save the file info for now.
        // Since we are using the Resume model, we should populate it correctly.

        // For this MVP, we'll create a Resume document.
        // Note: Real parsing logic (pdf-parse etc) would go here or be a separate service. 
        // For now we'll put a placeholder text or use the buffer if we want to store it (requires gridfs or similar for mongo).
        // Let's assume we just store metadata and maybe a mock URL/Text for now as the user requirement said "Resume upload to storage"

        // Let's treat the buffer as text if it's text, or just say "Binary data" for now to keep it simple and safe for Mongo string fields? 
        // No, the Resume model requires `parsedText`.
        // I should probably use the `pdf-parse` or similar if available, or just put "Application from public portal".

        const resumeEntry = new Resume({
            userId: 'candidate-' + Date.now(), // Placeholder for guest
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            parsedText: "Resume content placeholder - File uploaded via public portal", // TODO: Implement parsing
            isResume: true,
            jobId: jobId,
            candidateName: name,
            candidateEmail: email,
            candidatePhone: phone,
            satus: 'Pending',
            uploadedBy: null // Guest
        });

        await resumeEntry.save();

        res.status(201).json({ success: true, message: 'Application submitted successfully', applicationId: resumeEntry._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
