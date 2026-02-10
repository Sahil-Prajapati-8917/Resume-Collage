const mongoose = require('mongoose');
require('dotenv').config();
const HiringForm = require('./src/models/HiringForm');

async function checkForms() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to DB');
        const count = await HiringForm.countDocuments();
        console.log(`Found ${count} hiring forms.`);
        const forms = await HiringForm.find({}, 'formName');
        console.log('Forms:', forms);
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

checkForms();
