const mongoose = require('mongoose');
const Portfolio = require('./src/models/Portfolio');
require('dotenv').config();

const seedPortfolio = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');

        const existing = await Portfolio.findOne();
        if (existing) {
            console.log('Portfolio already exists, skipping seed.');
            process.exit(0);
        }

        const portfolioData = {
            ownerName: 'Sahil Prajapati',
            title: 'Full Stack Developer',
            bio: 'Passionate about building scalable web applications and AI-driven solutions.',
            email: 'sahil@example.com',
            phone: '+91 1234567890',
            socialLinks: {
                linkedin: 'https://linkedin.com/in/sahil-prajapati',
                github: 'https://github.com/sahil-prajapati',
                website: 'https://portfolio.sahil.com'
            },
            skills: [
                { name: 'React.js', level: 'Expert' },
                { name: 'Node.js', level: 'Expert' },
                { name: 'MongoDB', level: 'Intermediate' },
                { name: 'Tailwind CSS', level: 'Expert' }
            ],
            projects: [
                {
                    title: 'Resume Collage',
                    description: 'A full-stack resume portfolio management system.',
                    technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
                    link: 'https://resume-collage.demo',
                    githubLink: 'https://github.com/sahil-prajapati/resume-collage'
                }
            ],
            education: [
                {
                    institution: 'Tech University',
                    degree: 'Bachelor of Technology',
                    fieldOfStudy: 'Computer Science',
                    startDate: new Date('2020-08-01'),
                    endDate: new Date('2024-05-30'),
                    description: 'Focused on algorithms and software engineering.'
                }
            ],
            experience: [
                {
                    company: 'InnoTech Solutions',
                    position: 'Software Engineer Intern',
                    startDate: new Date('2023-06-01'),
                    endDate: new Date('2023-08-31'),
                    current: false,
                    description: 'Worked on front-end performance optimizations.'
                }
            ]
        };

        await Portfolio.create(portfolioData);
        console.log('Portfolio seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seedPortfolio();
