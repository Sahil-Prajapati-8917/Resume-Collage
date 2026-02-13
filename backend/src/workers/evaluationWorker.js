const { evaluationQueue } = require('../config/queue');
const Evaluation = require('../models/Evaluation');
const Resume = require('../models/Resume');
const HiringForm = require('../models/HiringForm');
const Prompt = require('../models/Prompt');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Re-using the single evaluate logic but adapted for worker
const evaluateResumeJob = async (job) => {
    const { resumeId, jobId, promptId, userId } = job.data;

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
        } else if (hiringForm.promptId) {
            // Fallback to job's default prompt if direct promptId not found/valid (though we passed specific promptId)
            // Ideally we use the passed promptId
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

Output valid JSON:
{
  "totalScore": number (0-100),
  "summary": string,
  "strengths": [string],
  "weaknesses": [string],
  "matchedSkills": [string],
  "confidence": number,
  "confidenceLevel": string ("High"|"Medium"|"Low"),
  "riskFlag": string ("Low"|"Medium"|"High")
}
`;

        // 3. Call AI
        const apiKey = process.env.GOOGLE_API_KEY;
        let evaluationResult = null;
        let usedModel = 'None';

        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(promptText);
                const response = await result.response;
                let text = response.text();

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
                // Fallback or re-throw
                throw err;
            }
        }

        if (!evaluationResult) {
            throw new Error('Failed to generate evaluation result');
        }

        // 4. Save Evaluation
        const evaluation = new Evaluation({
            resumeId,
            jobId,
            promptId,
            status: 'Completed',
            result: evaluationResult,
            evaluatedAt: new Date(),
            processingTimeMs: Date.now() - job.timestamp
        });

        await evaluation.save();

        // 5. Update Resume Status (Optional consistency)
        // We might want to keep the Resume.aiEvaluation for quick access, or migrate fully to Evaluation model.
        // For now, let's update Resume schema too for backward compatibility if needed, 
        // but the main source of truth for THIS feature is the Evaluation model.

        resume.aiEvaluation = {
            ...evaluationResult,
            metadata: { model: usedModel, timestamp: new Date() }
        };

        // Update specific status based on score
        const score = evaluationResult.totalScore || 0;
        if (score >= 80) resume.status = 'Shortlisted';
        else if (score >= 50) resume.status = 'Manual Review Required';
        else resume.status = 'Disqualified';

        await resume.save();

        return { success: true, evaluationId: evaluation._id };

    } catch (error) {
        console.error(`Evaluation Job Failed: ${error.message}`);
        // Log failure in Evaluation model if we created one? 
        // Or create a failed record.
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
