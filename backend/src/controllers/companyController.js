const Company = require('../models/Company');
const User = require('../models/User');
const Resume = require('../models/Resume');

// Get all companies with stats
exports.getCompanies = async (req, res) => {
    try {
        const { searchTerm, industry, status } = req.query;
        const query = {};

        if (industry && industry !== 'all') query.industry = industry;
        if (status && status !== 'all') query.status = status;
        if (searchTerm) {
            query.name = { $regex: searchTerm, $options: 'i' };
        }

        const companies = await Company.find(query).sort({ name: 1 }).lean();

        // Enrich with stats
        const enrichedCompanies = await Promise.all(companies.map(async (company) => {
            const userCount = await User.countDocuments({ company: company._id });
            const resumeCount = await Resume.countDocuments({ company: company._id });
            const evaluationCount = await Resume.countDocuments({
                company: company._id,
                status: { $in: ['evaluated', 'human_reviewed'] }
            });

            return {
                id: company._id,
                name: company.name,
                industry: company.industry,
                companySize: company.companySize,
                primaryHR: company.contactEmail || 'N/A',
                subscriptionPlan: company.subscriptionPlan || 'basic',
                status: company.status || 'active',
                users: userCount,
                resumes: resumeCount,
                evaluations: evaluationCount,
                lastActivity: company.updatedAt,
                createdAt: company.createdAt
            };
        }));

        res.json({ success: true, data: enrichedCompanies });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Create company
exports.createCompany = async (req, res) => {
    try {
        const { name, industry, companySize, primaryHR, subscriptionPlan } = req.body;

        const company = new Company({
            name,
            industry,
            companySize,
            contactEmail: primaryHR,
            subscriptionPlan,
            status: 'active'
        });

        await company.save();
        res.status(201).json({ success: true, data: company });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update company
exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByIdAndUpdate(id, req.body, { new: true });
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
        res.json({ success: true, data: company });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Deactivate company
exports.deactivateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findById(id);
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

        company.status = company.status === 'active' ? 'inactive' : 'active';
        await company.save();

        res.json({ success: true, data: company });
    } catch (error) {
        console.error('Error deactivating company:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
