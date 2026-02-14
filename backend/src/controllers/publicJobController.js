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

        // Validate Standard Fields
        const standardFields = job.standardFields || {};
        const missingStandardFields = [];

        if (standardFields.linkedIn && !req.body.linkedIn) missingStandardFields.push('LinkedIn Profile');
        if (standardFields.portfolio && !req.body.portfolio) missingStandardFields.push('Portfolio URL');
        if (standardFields.github && !req.body.github) missingStandardFields.push('GitHub Profile');
        if (standardFields.expectedSalary && !req.body.expectedSalary) missingStandardFields.push('Expected Salary');
        if (standardFields.currentSalary && !req.body.currentSalary) missingStandardFields.push('Current Salary');
        if (standardFields.noticePeriod && !req.body.noticePeriod) missingStandardFields.push('Notice Period');
        if (standardFields.experienceYears && !req.body.experienceYears) missingStandardFields.push('Years of Experience');
        if (standardFields.currentCompany && !req.body.currentCompany) missingStandardFields.push('Current Company');
        if (standardFields.currentDesignation && !req.body.currentDesignation) missingStandardFields.push('Current Designation');
        if (standardFields.workMode && !req.body.workMode) missingStandardFields.push('Preferred Work Mode');
        if (standardFields.relocate && req.body.relocate === undefined) missingStandardFields.push('Willing to Relocate');

        if (missingStandardFields.length > 0) {
            return res.status(400).json({ success: false, message: `Missing required fields: ${missingStandardFields.join(', ')}` });
        }

        // Validate Custom Fields
        const formData = req.body.formData ? JSON.parse(req.body.formData) : {};
        const customFields = job.applyFormFields || [];
        const missingCustomFields = [];

        for (const field of customFields) {
            // Check if field is required and conditionally shown
            // NOTE: complex conditional logic validation on backend might be tricky if it depends on other fields that are also being validated.
            // For now, we'll enforce required check if it is required.

            // TODO: Add backend-side conditional logic check to strictly allow/disallow fields based on conditions.
            // Current simple check: if required, it must be present.
            if (field.required && !formData[field.id]) {
                missingCustomFields.push(field.label);
            }
            // Regex validation
            if (field.validation && field.validation.regex && formData[field.id]) {
                const regex = new RegExp(field.validation.regex);
                if (!regex.test(formData[field.id])) {
                    return res.status(400).json({ success: false, message: `Invalid format for field: ${field.label}` });
                }
            }
        }

        if (missingCustomFields.length > 0) {
            return res.status(400).json({ success: false, message: `Missing required custom fields: ${missingCustomFields.join(', ')}` });
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
            uploadedBy: null, // Guest

            // Standard Fields
            linkedIn: req.body.linkedIn,
            portfolio: req.body.portfolio,
            github: req.body.github,
            expectedSalary: req.body.expectedSalary,
            currentSalary: req.body.currentSalary,
            noticePeriod: req.body.noticePeriod,
            experienceYears: req.body.experienceYears,
            currentCompany: req.body.currentCompany,
            currentDesignation: req.body.currentDesignation,
            workMode: req.body.workMode,
            relocate: req.body.relocate === 'true' || req.body.relocate === true,

            // Capture Dynamic Form Data
            formData: formData
        });

        await resumeEntry.save();

        res.status(201).json({ success: true, message: 'Application submitted successfully', applicationId: resumeEntry._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
