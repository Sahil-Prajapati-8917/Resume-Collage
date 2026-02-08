const mongoose = require('mongoose');
require('dotenv').config();
const Resume = require('./src/models/Resume');

async function clearResumes() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to DB');

        const result = await Resume.deleteMany({});
        console.log(`Deleted ${result.deletedCount} resumes and their evaluations.`);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

clearResumes();
