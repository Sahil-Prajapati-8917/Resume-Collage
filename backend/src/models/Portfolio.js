const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
    ownerName: {
        type: String,
        required: [true, 'Owner Name is required'],
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    bio: {
        type: String
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    socialLinks: {
        linkedin: String,
        github: String,
        twitter: String,
        website: String
    },
    skills: [{
        name: String,
        level: String // e.g., Beginner, Intermediate, Expert
    }],
    projects: [{
        title: String,
        description: String,
        technologies: [String],
        link: String,
        githubLink: String,
        image: String
    }],
    education: [{
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        description: String
    }],
    experience: [{
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String
    }],
    lastUpdated: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
