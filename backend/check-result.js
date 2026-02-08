const mongoose = require('mongoose');
require('dotenv').config();
const Resume = require('./src/models/Resume');

async function checkLastEvaluation() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to DB');

        const resume = await Resume.findOne().sort({ uploadedAt: -1 });

        if (resume) {
            console.log("\n--- MOST RECENT RESUME ---");
            console.log("File Name:", resume.fileName);
            console.log("Status:", resume.status);
            console.log("\n--- STORED AI EVALUATION DATA (in MongoDB) ---");
            console.log(JSON.stringify(resume.aiEvaluation, null, 2));
        } else {
            console.log("No resumes found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

checkLastEvaluation();
