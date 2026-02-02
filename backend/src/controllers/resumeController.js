const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');


exports.parseResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { buffer, mimetype, originalname } = req.file;
        let extractedText = '';
        let isResume = true;
        let anomalies = [];

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
            return res.status(400).json({
                success: false,
                message: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.'
            });
        }

        // Validate if the content is a resume
        const validationResult = validateResumeContent(extractedText);
        isResume = validationResult.isResume;
        anomalies = validationResult.anomalies;

        // Clean up text (optional but recommended)
        extractedText = extractedText.replace(/\s+/g, ' ').trim();

        // Save parsed text to the database
        const resume = new Resume({
            userId: req.user?._id || 'anonymous', // Use anonymous if user is not authenticated
            fileName: originalname,
            fileType: mimetype,
            parsedText: extractedText,
            isResume: isResume,
            anomalies: anomalies,
            status: 'Under Process'
        });

        await resume.save();

        return res.status(200).json({
            success: true,
            message: 'Resume parsed and stored successfully',
            data: {
                fileName: originalname,
                text: extractedText,
                resumeId: resume._id,
                isResume: isResume,
                anomalies: anomalies
            }
        });
    } catch (error) {
        console.error('Resume parsing error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to parse and store resume',
            error: error.message
        });
    }
};

// Get all resumes with filtering
exports.getResumes = async (req, res) => {
    try {
        const { status, confidence, riskFlag } = req.query;
        let query = {};

        if (status) query.status = status;
        // Handle confidence level separately if needed, but assuming direct mapping for now if schema matches
        if (confidence) query['aiEvaluation.confidenceLevel'] = confidence;
        if (riskFlag) query['aiEvaluation.riskFlag'] = riskFlag;

        const resumes = await Resume.find(query).sort({ uploadedAt: -1 });

        return res.status(200).json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    } catch (error) {
        console.error('Error fetching resumes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch resumes',
            error: error.message
        });
    }
};

// Update Resume Status
exports.updateResumeStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const { id } = req.params;

        const resume = await Resume.findById(id);
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Validate reason for Disqualified
        if (status === 'Disqualified' && !reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason is required for disqualification'
            });
        }

        // Add to history
        resume.statusHistory.push({
            status: status,
            evaluatedBy: req.user?._id, // Assuming auth middleware adds user
            reason: reason
        });

        resume.status = status;
        await resume.save();

        return res.status(200).json({
            success: true,
            data: resume
        });

    } catch (error) {
        console.error('Error updating resume status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update resume status',
            error: error.message
        });
    }
};

// Bulk Update Status
exports.bulkUpdateResumeStatus = async (req, res) => {
    try {
        const { resumeIds, status, reason } = req.body;

        if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No resume IDs provided'
            });
        }

        if (status === 'Disqualified' && !reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason is required for bulk disqualification'
            });
        }

        const updateOperation = {
            $set: { status: status },
            $push: {
                statusHistory: {
                    status: status,
                    evaluatedBy: req.user?._id,
                    reason: reason,
                    timestamp: new Date()
                }
            }
        };

        const result = await Resume.updateMany(
            { _id: { $in: resumeIds } },
            updateOperation
        );

        return res.status(200).json({
            success: true,
            message: `Successfully updated ${result.modifiedCount} resumes`,
            data: result
        });

    } catch (error) {
        console.error('Error bulk updating resumes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to bulk update resumes',
            error: error.message
        });
    }
};

// Helper function to validate if the content is a resume
function validateResumeContent(text) {
    const anomalies = [];
    let isResume = true;

    // Check for common resume keywords
    const resumeKeywords = [
        'experience', 'education', 'skills', 'summary', 'objective',
        'work history', 'employment', 'qualifications', 'certifications',
        'contact', 'phone', 'email', 'address', 'linkedin', 'github'
    ];

    const keywordMatches = resumeKeywords.filter(keyword =>
        text.toLowerCase().includes(keyword)
    );

    // If fewer than 3 keywords are found, it might not be a resume
    if (keywordMatches.length < 3) {
        isResume = false;
        anomalies.push('Fewer than 3 common resume keywords found');
    }

    // Check for minimum length
    if (text.length < 200) {
        isResume = false;
        anomalies.push('Text is too short to be a resume');
    }

    // Check for excessive repetition (possible spam or non-resume content)
    const wordCount = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/));
    const uniqueWordCount = uniqueWords.size;

    if (wordCount > 100 && uniqueWordCount / wordCount < 0.2) {
        anomalies.push('Excessive repetition detected');
    }

    return { isResume, anomalies };
}
