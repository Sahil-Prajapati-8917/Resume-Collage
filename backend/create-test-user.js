require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGO_URI = 'mongodb+srv://galanijas12_db_user:jas12@cluster0.xpj7qjn.mongodb.net/?appName=Cluster0';

async function createTestUser() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const email = 'testuser@example.com';
        const password = 'password123';

        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists');
            process.exit(0);
        }

        user = new User({
            email,
            password,
            username: 'testuser',
            organizationName: 'Test Org',
            industry: 'Technology',
            companySize: '1-10',
            country: 'USA',
            organizationType: 'Private',
            fullName: 'Test User',
            phoneNumber: '1234567890',
            jobTitle: 'HR Manager',
            role: 'admin',
            complianceAccepted: {
                aiAcknowledgment: true,
                humanLoopUnderstanding: true,
                auditLoggingAcceptance: true,
                dataProcessingAcceptance: true
            }
        });

        await user.save();
        console.log('User created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating user:', error);
        process.exit(1);
    }
}

createTestUser();
