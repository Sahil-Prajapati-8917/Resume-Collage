const Prompt = require('../models/Prompt');
const Industry = require('../models/Industry');

exports.getAllPrompts = async (req, res) => {
    try {
        const prompts = await Prompt.find({}).sort({ isDefault: -1, createdAt: -1 }).lean();

        res.status(200).json({
            success: true,
            count: prompts.length,
            data: prompts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.getPromptsByIndustry = async (req, res) => {
    try {
        const { industryId } = req.params;
        const { page = 1, limit = 10, all = false } = req.query;

        let query = { industryId };

        // If industryId is not a valid ObjectId, try to find it by name
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(industryId)) {
            const industry = await Industry.findOne({ name: industryId });
            if (industry) {
                query = { industryId: industry._id };
            } else {
                // Return empty if industry not found by name
                return res.status(200).json({
                    success: true,
                    count: 0,
                    total: 0,
                    data: []
                });
            }
        }

        let mongoQuery = Prompt.find(query).sort({ isDefault: -1, createdAt: -1 }).lean();

        if (all !== 'true') {
            mongoQuery = mongoQuery.limit(limit * 1).skip((page - 1) * limit);
        }

        const prompts = await mongoQuery;
        const total = await Prompt.countDocuments(query);

        res.status(200).json({
            success: true,
            count: prompts.length,
            total,
            pagination: all === 'true' ? null : {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data: prompts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.createPrompt = async (req, res) => {
    try {
        const { name, industryId, prompt, version, isDefault } = req.body;

        const newPrompt = await Prompt.create({
            name,
            industryId,
            prompt,
            version,
            isDefault
        });

        res.status(201).json({
            success: true,
            data: newPrompt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.updatePrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const prompt = await Prompt.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

        res.status(200).json({
            success: true,
            data: prompt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.deletePrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const prompt = await Prompt.findByIdAndDelete(id);

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

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
