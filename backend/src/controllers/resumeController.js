const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');
const HiringForm = require('../models/HiringForm');
const Prompt = require('../models/Prompt');
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.parseResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
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
            return res.status(400).json({ success: false, message: 'Unsupported file type.' });
        }

        const validationResult = validateResumeContent(extractedText);
        isResume = validationResult.isResume;
        anomalies = validationResult.anomalies;

        // Clean up text (optional but recommended)
        extractedText = extractedText.replace(/\s+/g, ' ').trim();

        if (!extractedText) {
            console.error('Resume parsing failed: No text extracted from file', {
                fileName: originalname,
                fileType: mimetype,
                bufferLength: buffer.length
            });
            return res.status(400).json({
                success: false,
                message: 'Failed to extract text from the file. Please ensure the file is not empty or a scanned image/protected PDF.'
            });
        }

        const resume = new Resume({
            userId: req.user?._id || 'anonymous',
            fileName: originalname,
            fileType: mimetype,
            parsedText: extractedText,
            isResume: isResume,
            anomalies: anomalies,
            status: 'Under Process',
            qualityScore: 0,
            integritySignals: []
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
        return res.status(500).json({ success: false, message: 'Failed to parse resume', error: error.message });
    }
};

exports.getResumes = async (req, res) => {
    try {
        const { status, confidence, riskFlag, jobId } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (confidence) query['aiEvaluation.confidenceLevel'] = confidence;
        if (riskFlag) query['aiEvaluation.riskFlag'] = riskFlag;
        if (jobId && jobId !== 'all') query.jobId = jobId;

        const resumes = await Resume.find(query).sort({ uploadedAt: -1 }).lean();
        return res.status(200).json({ success: true, count: resumes.length, data: resumes });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch resumes', error: error.message });
    }
};

exports.getResumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findById(id);
        if (!resume) {
            return res.status(404).json({ success: false, message: 'Resume not found' });
        }
        return res.status(200).json({ success: true, data: resume });
    } catch (error) {
        console.error('Error fetching resume by ID:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch resume', error: error.message });
    }
};

exports.updateResumeStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const { id } = req.params;
        const { sendShortlistEmail, sendRejectionEmail } = require('../services/emailService');

        const resume = await Resume.findById(id).populate('jobId');
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

        // Send Email Notification
        if (resume.jobId && resume.candidateEmail) {
            const jobTitle = resume.jobId.title || 'Job Application';
            if (status === 'Shortlisted') {
                await sendShortlistEmail(resume.candidateName, resume.candidateEmail, jobTitle);
            } else if (status === 'Disqualified') {
                await sendRejectionEmail(resume.candidateName, resume.candidateEmail, jobTitle);
            }
        }

        return res.status(200).json({ success: true, data: resume });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
    }
};

exports.bulkUpdateResumeStatus = async (req, res) => {
    try {
        const { resumeIds, status, reason } = req.body;
        if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length === 0) return res.status(400).json({ success: false, message: 'No resume IDs' });
        if (status === 'Disqualified' && !reason) return res.status(400).json({ success: false, message: 'Reason required' });

        const result = await Resume.updateMany(
            { _id: { $in: resumeIds } },
            { $set: { status }, $push: { statusHistory: { status, evaluatedBy: req.user?._id, reason, timestamp: new Date() } } }
        );
        return res.status(200).json({ success: true, message: `Updated ${result.modifiedCount}`, data: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to bulk update', error: error.message });
    }
};

function validateResumeContent(text) {
    const anomalies = [];
    let isResume = true;
    const resumeKeywords = ['experience', 'education', 'skills', 'summary', 'objective', 'work history', 'employment', 'qualifications', 'certifications', 'contact', 'phone', 'email', 'address', 'linkedin', 'github'];
    const keywordMatches = resumeKeywords.filter(keyword => text.toLowerCase().includes(keyword));

    if (keywordMatches.length < 3) { isResume = false; anomalies.push('Fewer than 3 common resume keywords found'); }
    if (text.length < 200) { isResume = false; anomalies.push('Text is too short'); }

    return { isResume, anomalies };
}

function performHeuristicEvaluation(resumeText, hiringForm) {
    console.log("Starting Heuristic Evaluation...");
    const text = (resumeText || "").toLowerCase();
    let score = 0;
    const strengths = [];
    const weaknesses = [];
    const details = { skillsMatch: 0, experienceMatch: 0, requirementsMatch: 0 };

    const keywords = [...(hiringForm.requirements || []), ...(hiringForm.responsibilities || [])].map(k => k.toLowerCase());

    if (keywords.length === 0) {
        score = 50;
        details.requirementsMatch = 50;
    } else {
        let matches = 0;
        keywords.forEach(keyword => {
            if (text.includes(keyword)) {
                matches++;
                if (strengths.length < 5) strengths.push(`Matches: ${keyword}`);
            } else {
                if (weaknesses.length < 5) weaknesses.push(`Missing: ${keyword}`);
            }
        });
        const matchRatio = matches / keywords.length;
        score += matchRatio * 60;
        details.requirementsMatch = Math.round(matchRatio * 100);
    }

    if (text.length > 500) { score += 40; } else { score += 20; weaknesses.push("Resume content is brief"); }
    const totalScore = Math.min(Math.round(score), 100);

    return {
        totalScore,
        summary: `[Fallback Evaluation] Candidate scored ${totalScore}/100 based on keyword matching.`,
        strengths,
        weaknesses,
        details,
        confidence: 60,
        confidenceLevel: 'Low',
        riskFlag: totalScore < 40 ? 'High' : 'Low'
    };
}

exports.downloadResume = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findById(id);

        if (!resume) {
            return res.status(404).json({ success: false, message: 'Resume not found' });
        }

        // If we have the actual file stored, serve it
        if (resume.resumeUrl) {
            return res.redirect(resume.resumeUrl);
        }

        // If we only have the parsed text, create a text file
        if (resume.parsedText) {
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName.replace(/\.[^/.]+$/, '')}_parsed.txt"`);
            return res.send(resume.parsedText);
        }

        return res.status(404).json({ success: false, message: 'Resume file not available' });
    } catch (error) {
        console.error('Error downloading resume:', error);
        return res.status(500).json({ success: false, message: 'Failed to download resume', error: error.message });
    }
};

exports.evaluateResume = async (req, res) => {
    console.log('Starting evaluateResume...');
    try {
        const { resumeId, hiringFormId } = req.body;
        if (!resumeId || !hiringFormId) return res.status(400).json({ success: false, message: 'Resume ID and Hiring Form ID required' });

        const resume = await Resume.findById(resumeId);
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
        const hiringForm = await HiringForm.findById(hiringFormId);
        if (!hiringForm) return res.status(404).json({ success: false, message: 'Hiring Form not found' });

        const result = await evaluateSingleResume(resume, hiringForm);

        return res.status(200).json({ success: true, message: 'Evaluated successfully', data: result.resume, evalModel: result.model });

    } catch (error) {
        console.error('Error evaluating resume:', error);
        return res.status(500).json({ success: false, message: 'Evaluation failed', error: error.message });
    }
};

exports.bulkEvaluateResumes = async (req, res) => {
    try {
        const { jobId, promptId, candidateIds } = req.body;

        if (!jobId) {
            return res.status(400).json({ success: false, message: 'Job ID is required' });
        }

        const hiringForm = await HiringForm.findById(jobId);
        if (!hiringForm) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // If promptId is provided, override the job's promptId
        if (promptId) {
            hiringForm.promptId = promptId;
        }

        let query = { jobId: jobId };

        // If specific candidates selected, filter by them
        if (candidateIds && Array.isArray(candidateIds) && candidateIds.length > 0) {
            query._id = { $in: candidateIds };
        } else {
            // Otherwise, target resumes that are Pending or Under Process, or maybe just all?
            // Let's target all for now to allow re-evaluation, or maybe just filter by those not Disqualified?
            // For bulk, usually we want to process everything that isn't Final.
            // But to be safe and simple, let's just process everything for this Job.
        }

        const resumes = await Resume.find(query);

        if (resumes.length === 0) {
            return res.status(404).json({ success: false, message: 'No resumes found to evaluate' });
        }

        console.log(`Starting bulk evaluation for ${resumes.length} resumes...`);

        const results = {
            successful: 0,
            failed: 0,
            details: []
        };

        // Process in parallel with a limit might be better, but for now sequential or Promise.all
        // standard Promise.all might hit rate limits.
        // Let's do a simple loop for MVP.

        const { sendShortlistEmail, sendRejectionEmail } = require('../services/emailService');

        for (const resume of resumes) {
            try {
                // 1. Evaluate
                const evalResult = await evaluateSingleResume(resume, hiringForm);
                const updatedResume = evalResult.resume;

                // 2. Status is already updated in evaluateSingleResume based on score
                // But we need to save the specific reason/history if needed

                // 3. Send Email based on status
                if (updatedResume.candidateEmail) {
                    const jobTitle = hiringForm.title || 'Job Application';
                    if (updatedResume.status === 'Shortlisted') {
                        await sendShortlistEmail(updatedResume.candidateName, updatedResume.candidateEmail, jobTitle);
                        results.details.push({ id: resume._id, status: 'Shortlisted', emailSent: true });
                    } else if (updatedResume.status === 'Disqualified') {
                        await sendRejectionEmail(updatedResume.candidateName, updatedResume.candidateEmail, jobTitle);
                        results.details.push({ id: resume._id, status: 'Disqualified', emailSent: true });
                    } else {
                        results.details.push({ id: resume._id, status: updatedResume.status, emailSent: false });
                    }
                } else {
                    results.details.push({ id: resume._id, status: updatedResume.status, emailSent: false, error: 'No email' });
                }

                results.successful++;
            } catch (err) {
                console.error(`Failed to evaluate resume ${resume._id}:`, err);
                results.failed++;
                results.details.push({ id: resume._id, status: 'failed', error: err.message });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Bulk evaluation completed. Success: ${results.successful}, Failed: ${results.failed}`,
            data: results
        });

    } catch (error) {
        console.error('Error in bulk evaluation:', error);
        return res.status(500).json({ success: false, message: 'Bulk evaluation failed', error: error.message });
    }
};

async function evaluateSingleResume(resume, hiringForm) {
    let basePromptInstructions = "You are an expert HR AI assistant.";

    // Fetch prompt if promptId exists on the form (which might have been updated temporarily in memory for bulk op)
    if (hiringForm.promptId) {
        try {
            const promptDoc = await Prompt.findById(hiringForm.promptId);
            if (promptDoc && promptDoc.prompt) basePromptInstructions = promptDoc.prompt;
        } catch (pError) { console.error("Error fetching prompt:", pError); }
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    let evaluationResult = null;
    let usedModel = 'None';

    // Prepare Prompt
    const responsibilities = hiringForm.responsibilities || [];
    const requirements = hiringForm.requirements || [];
    const roleExpectations = hiringForm.roleExpectations || [];
    const performanceIndicators = hiringForm.performanceIndicators || [];


    const promptText = `
${basePromptInstructions}

Job Details:
- Title: ${hiringForm.title || 'N/A'}
- Industry: ${hiringForm.industry || 'N/A'}
- Experience Level: ${hiringForm.experienceLevel || 'N/A'}
- Job Type: ${hiringForm.jobType || 'N/A'}

Responsibilities:
${responsibilities.map(r => `- ${r}`).join('\n')}

Requirements:
${requirements.map(r => `- ${r}`).join('\n')}

Role Expectations:
${roleExpectations.map(r => `- ${r}`).join('\n')}

Performance Indicators:
${performanceIndicators.map(r => `- ${r}`).join('\n')}

Candidate Resume Content:
${resume.parsedText || ''}

Task: Evaluate the candidate's resume against the provided job details.

Output Format: Return valid JSON ONLY.
{
  "totalScore": number (0-100),
  "summary": string,
  "strengths": [string],
  "weaknesses": [string],
  "matchedSkills": [string], // Skills from requirements that candidate has
  "missingSkills": [string], // Skills from requirements that candidate lacks
  "candidateSkills": [string], // All technical and soft skills found in resume
  "details": { "skillsMatch": number, "experienceMatch": number, "requirementsMatch": number },
  "confidence": number,
  "confidenceLevel": string,
  "riskFlag": string
}
`;

    if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try Gemini 1.5 Flash
        try {
            // console.log('Sending request to Gemini 1.5 Flash...');
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(promptText);
            const response = await result.response;
            let text = response.text();

            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonStartIndex = text.indexOf('{');
            const jsonEndIndex = text.lastIndexOf('}');
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                text = text.substring(jsonStartIndex, jsonEndIndex + 1);
            }

            evaluationResult = JSON.parse(text);
            usedModel = 'Gemini-1.5-Flash';
            // console.log('Gemini 1.5 Flash success');
        } catch (flashError) {
            console.error('Gemini 1.5 Flash failed:', flashError.message);

            // Try Gemini Pro
            try {
                console.log('Retrying with Gemini Pro...');
                const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
                const result = await modelPro.generateContent(promptText);
                const response = await result.response;
                let text = response.text();

                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const jsonStartIndex = text.indexOf('{');
                const jsonEndIndex = text.lastIndexOf('}');
                if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                    text = text.substring(jsonStartIndex, jsonEndIndex + 1);
                }

                evaluationResult = JSON.parse(text);
                usedModel = 'Gemini-Pro';
                console.log('Gemini Pro success');
            } catch (proError) {
                console.error('Gemini Pro failed:', proError.message);
            }
        }
    }

    // Fallback
    if (!evaluationResult) {
        console.log('Falling back to Heuristic Evaluation');
        evaluationResult = performHeuristicEvaluation(resume.parsedText, hiringForm);
        usedModel = 'Heuristic-Fallback';
    }

    resume.aiEvaluation = {
        totalScore: evaluationResult.totalScore || 0,
        summary: evaluationResult.summary || 'No summary',
        strengths: evaluationResult.strengths || [],
        weaknesses: evaluationResult.weaknesses || [],
        matchedSkills: evaluationResult.matchedSkills || [],
        missingSkills: evaluationResult.missingSkills || [],
        candidateSkills: evaluationResult.candidateSkills || [],
        details: evaluationResult.details || { skillsMatch: 0, experienceMatch: 0, requirementsMatch: 0 },
        confidence: evaluationResult.confidence || 0,
        confidenceLevel: evaluationResult.confidenceLevel || 'Low',
        riskFlag: evaluationResult.riskFlag || 'Medium',
        metadata: { model: usedModel, timestamp: new Date() }
    };

    const score = evaluationResult.totalScore || 0;
    if (score >= 80) resume.status = 'Shortlisted';
    else if (score >= 50) resume.status = 'Manual Review Required';
    else resume.status = 'Disqualified';

    resume.industry = hiringForm.industry;
    resume.roleType = hiringForm.title;

    await resume.save();
    console.log('Resume updated successfully with model:', usedModel);

    return { resume, model: usedModel };
}
