require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

const MONGO_URI = process.env.DATABASE_URL;

async function createTestUser() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB:', MONGO_URI.split('@')[1].split('/')[0]); // Log part of the URI for safety

        const email = 'testuser@example.com';
        const password = 'password123';

        let user = await User.findOne({ email });
        if (!user) {
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
        } else {
            console.log('User already exists');
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        console.log('--- TOKEN START ---');
        console.log(token);
        console.log('--- TOKEN END ---');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUser();

