const mongoose = require('mongoose');
require('dotenv').config();
const Industry = require('./src/models/Industry');

async function checkIndustries() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to DB');
        const count = await Industry.countDocuments();
        console.log(`Found ${count} industries.`);
        const industries = await Industry.find({});
        console.log('Industries:', industries);
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

checkIndustries();
