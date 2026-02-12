const HiringForm = require('../models/HiringForm');
const Resume = require('../models/Resume');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

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

        // Helper to validate content - kept simple here
        const validateResumeContent = (text) => {
            const anomalies = [];
            let isResume = true;
            if (text.length < 50) { isResume = false; anomalies.push('Text is too short'); }
            return { isResume, anomalies };
        };

        const { buffer, mimetype, originalname } = req.file;
        let extractedText = '';

        // Parse File
        if (mimetype === 'application/pdf') {
            const data = await pdf(buffer);
            extractedText = data.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimetype === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        } else if (mimetype === 'text/plain') {
            extractedText = buffer.toString('utf8');
        } else {
            // Fallback for others or error
            extractedText = "Could not parse file content.";
        }

        // Clean text
        extractedText = extractedText ? extractedText.replace(/\s+/g, ' ').trim() : '';

        if (!extractedText) {
            extractedText = "Text extraction failed or content is empty/scanned image.";
        }

        const { isResume, anomalies } = validateResumeContent(extractedText);

        const resumeEntry = new Resume({
            userId: 'candidate-' + Date.now(), // Placeholder for guest
            fileName: originalname,
            fileType: mimetype,
            parsedText: extractedText,
            isResume: isResume,
            anomalies: anomalies,
            jobId: jobId,
            candidateName: name,
            candidateEmail: email,
            candidatePhone: phone,
            status: 'Pending', // Fixed typo: satus -> status
            uploadedBy: null // Guest
        });

        await resumeEntry.save();

        res.status(201).json({ success: true, message: 'Application submitted successfully', applicationId: resumeEntry._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
