const Industry = require('../models/Industry');

exports.getIndustries = async (req, res) => {
    try {
        const industries = await Industry.find().sort({ name: 1 }).lean();

        res.status(200).json({
            success: true,
            count: industries.length,
            data: industries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.createIndustry = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an industry name'
            });
        }

        const industry = await Industry.create({ name });

        res.status(201).json({
            success: true,
            data: industry
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Industry already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.deleteIndustry = async (req, res) => {
    try {
        const industry = await Industry.findById(req.params.id);

        if (!industry) {
            return res.status(404).json({
                success: false,
                message: 'Industry not found'
            });
        }
        // console.log("industry");
        await industry.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
