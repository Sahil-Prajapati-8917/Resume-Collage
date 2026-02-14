const { evaluationQueue } = require('../config/queue');
const Evaluation = require('../models/Evaluation');
const Resume = require('../models/Resume');
const HiringForm = require('../models/HiringForm');
const Prompt = require('../models/Prompt');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Re-using the single evaluate logic but adapted for worker
const evaluateResumeJob = async (job) => {
    const { resumeId, jobId, promptId } = job.data;
    const startTime = Date.now();

    try {
        console.log(`Processing evaluation job for resume: ${resumeId}`);

        // 1. Fetch Data
        const resume = await Resume.findById(resumeId);
        const hiringForm = await HiringForm.findById(jobId);
        const promptDoc = await Prompt.findById(promptId);

        if (!resume || !hiringForm) {
            throw new Error('Resume or Job not found');
        }

        // 2. Prepare AI Prompt
        let basePromptInstructions = "You are an expert HR AI assistant.";
        if (promptDoc && promptDoc.prompt) {
            basePromptInstructions = promptDoc.prompt;
        }

        const responsibilities = hiringForm.responsibilities || [];
        const requirements = hiringForm.requirements || [];

        const promptText = `
${basePromptInstructions}

Job Details:
- Title: ${hiringForm.title}
- Industry: ${hiringForm.industry}
- Level: ${hiringForm.experienceLevel}

Requirements:
${requirements.map(r => `- ${r}`).join('\n')}

Responsibilities:
${responsibilities.map(r => `- ${r}`).join('\n')}

Candidate Resume:
${resume.parsedText}

Analyze the candidate critically. Detect any risks or inconsistencies.
Output ONLY valid JSON in the following format:
{
  "totalScore": number (0-100),
  "summary": string,
  "strengths": [string],
  "weaknesses": [string],
  "matchedSkills": [string],
  "missingSkills": [string],
  "transparency": {
    "skillMatch": number (0-100),
    "experienceMatch": number (0-100),
    "domainFit": number (0-100),
    "benchmark": string (e.g. "Top 10%", "Average", "Below Average")
  },
  "risks": [
    {
      "flag": string,
      "level": "Low" | "Medium" | "High",
      "details": string
    }
  ],
  "confidence": number (0-100),
  "confidenceLevel": "High" | "Medium" | "Low",
  "riskFlag": "Low" | "Medium" | "High"
}
`;

        // 3. Call AI
        const apiKey = process.env.GOOGLE_API_KEY;
        let evaluationResult = null;
        let usedModel = 'None';
        let tokensUsed = 0;

        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(promptText);
                const response = await result.response;
                let text = response.text();

                // Estimate tokens (approx 4 chars per token)
                tokensUsed = Math.ceil((promptText.length + text.length) / 4);

                // Clean markdown
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    text = text.substring(jsonStart, jsonEnd + 1);
                }

                evaluationResult = JSON.parse(text);
                usedModel = 'Gemini-1.5-Flash';
            } catch (err) {
                console.error('AI Generation failed:', err);
                throw err;
            }
        }

        if (!evaluationResult) {
            throw new Error('Failed to generate evaluation result');
        }

        // 4. Smart Automation Rules
        const cutoffs = hiringForm.cutOffSettings || { autoShortlist: 85, manualReview: 65, autoReject: 60 };
        const score = evaluationResult.totalScore || 0;
        let recommendation = 'Review';

        if (score >= cutoffs.autoShortlist) {
            recommendation = 'Shortlist';
        } else if (score <= cutoffs.autoReject) {
            recommendation = 'Reject';
        } else {
            recommendation = 'Review';
        }


        // 5. Save Evaluation
        const evaluation = new Evaluation({
            resumeId,
            jobId,
            promptId,
            status: 'Completed',
            result: {
                ...evaluationResult,
                // Map new fields to schema structure
                transparency: evaluationResult.transparency,
                risks: evaluationResult.risks
            },
            cost: {
                tokensUsed,
                estimatedCost: (tokensUsed / 1000) * 0.0005, // Approx cost for Flash
                model: usedModel
            },
            evaluatedAt: new Date(),
            processingTimeMs: Date.now() - startTime
        });

        await evaluation.save();

        // 6. Update Resume Status
        resume.aiEvaluation = {
            ...evaluationResult,
            metadata: { model: usedModel, timestamp: new Date() }
        };

        // Map recommendation to resume status
        if (recommendation === 'Shortlist') resume.status = 'Shortlisted';
        else if (recommendation === 'Reject') resume.status = 'Disqualified';
        else resume.status = 'Manual Review Required';

        await resume.save();

        return { success: true, evaluationId: evaluation._id };

    } catch (error) {
        console.error(`Evaluation Job Failed: ${error.message}`);
        await Evaluation.create({
            resumeId,
            jobId,
            promptId,
            status: 'Failed',
            error: error.message,
            evaluatedAt: new Date()
        });
        throw error;
    }
};

evaluationQueue.process(async (job) => {
    return evaluateResumeJob(job);
});

module.exports = evaluationQueue;
