const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const HiringForm = require('./src/models/HiringForm');
const Prompt = require('./src/models/Prompt');
const Industry = require('./src/models/Industry');

async function run() {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is undefined");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);

        // Find or create Industry
        let industry = await Industry.findOne({ name: 'Technology' });
        if (!industry) {
            industry = await Industry.create({ name: 'Technology' });
        }

        // Find or create Prompt
        let prompt = await Prompt.findOne({ industry: industry._id });
        if (!prompt) {
            prompt = await Prompt.create({
                industry: industry._id,
                title: 'Default Tech Prompt',
                content: 'Evaluate this resume.',
                type: 'Evaluation'
            });
        }

        // Create Hiring Form
        const form = await HiringForm.create({
            formName: "Test Dynamic Job " + Date.now(),
            title: "Dynamic Engineer",
            description: "Testing dynamic forms",
            industry: "Technology",
            promptId: prompt._id,
            deadline: new Date("2025-12-31"),
            jobType: "full-time",
            experienceLevel: "Mid-Level (5-8 years)",
            location: "Remote",
            responsibilities: ["Coding"],
            requirements: ["Node.js"],
            applyFormFields: [
                { id: "github", type: "text", label: "GitHub Profile", required: true },
                { id: "experience_years", type: "number", label: "Years of Experience", required: false }
            ]
        });

        console.log("JOB_ID:" + form._id);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

run();
