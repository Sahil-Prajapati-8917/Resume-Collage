const Prompt = require('../models/Prompt');
const Industry = require('../models/Industry');

exports.getPromptsByIndustry = async (req, res) => {
    try {
        const { industryId } = req.params;
        const prompts = await Prompt.find({ industryId }).sort({ isDefault: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
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
