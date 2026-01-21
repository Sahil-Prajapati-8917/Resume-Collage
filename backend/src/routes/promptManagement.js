const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');

// Create new prompt version
router.post('/', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { 
            name, 
            industry, 
            promptText, 
            version, 
            isActive, 
            description 
        } = req.body;

        // Check if prompt with same name and version exists
        const existingPrompt = await Prompt.findOne({ 
            name, 
            version,
            industry 
        });
        
        if (existingPrompt) {
            return res.status(400).json({
                success: false,
                error: { message: 'Prompt with this name, version, and industry already exists' }
            });
        }

        const prompt = new Prompt({
            name,
            industry,
            promptText,
            version,
            isActive: isActive !== false,
            description,
            createdBy: req.user._id
        });

        await prompt.save();

        logger.info(`Prompt created: ${prompt.name} v${prompt.version} by ${req.user.email}`);
        
        res.status(201).json({
            success: true,
            data: prompt
        });
    } catch (error) {
        logger.error('Error creating prompt:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get all prompts with pagination and filtering
router.get('/', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            industry, 
            isActive, 
            search 
        } = req.query;
        
        const query = {};
        
        if (industry) query.industry = industry;
        if (isActive !== undefined) query.isActive = isActive;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const prompts = await Prompt.find(query)
            .populate('createdBy', 'email firstName lastName')
            .sort({ industry: 1, name: 1, version: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Prompt.countDocuments(query);

        res.json({
            success: true,
            data: prompts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('Error fetching prompts:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get prompt by ID
router.get('/:id', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id)
            .populate('createdBy', 'email firstName lastName');

        if (!prompt) {
            return res.status(404).json({
                success: false,
                error: { message: 'Prompt not found' }
            });
        }

        res.json({
            success: true,
            data: prompt
        });
    } catch (error) {
        logger.error('Error fetching prompt:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Update prompt
router.put('/:id', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { promptText, isActive, description } = req.body;

        const prompt = await Prompt.findById(req.params.id);
        if (!prompt) {
            return res.status(404).json({
                success: false,
                error: { message: 'Prompt not found' }
            });
        }

        // Create a new version instead of updating existing
        const newVersion = prompt.version + 1;
        
        const newPrompt = new Prompt({
            name: prompt.name,
            industry: prompt.industry,
            promptText: promptText || prompt.promptText,
            version: newVersion,
            isActive: isActive !== undefined ? isActive : prompt.isActive,
            description: description || prompt.description,
            createdBy: req.user._id
        });

        await newPrompt.save();

        // Deactivate old version
        prompt.isActive = false;
        await prompt.save();

        logger.info(`Prompt updated: ${newPrompt.name} v${newPrompt.version} by ${req.user.email}`);
        
        res.status(201).json({
            success: true,
            data: newPrompt,
            message: 'New version created successfully'
        });
    } catch (error) {
        logger.error('Error updating prompt:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Delete prompt (deactivate)
router.delete('/:id', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id);
        if (!prompt) {
            return res.status(404).json({
                success: false,
                error: { message: 'Prompt not found' }
            });
        }

        prompt.isActive = false;
        await prompt.save();

        logger.info(`Prompt deactivated: ${prompt.name} v${prompt.version} by ${req.user.email}`);
        
        res.json({
            success: true,
            message: 'Prompt deactivated successfully'
        });
    } catch (error) {
        logger.error('Error deactivating prompt:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Activate prompt version
router.post('/:id/activate', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id);
        if (!prompt) {
            return res.status(404).json({
                success: false,
                error: { message: 'Prompt not found' }
            });
        }

        // Deactivate all other versions of this prompt
        await Prompt.updateMany(
            { 
                name: prompt.name, 
                industry: prompt.industry,
                _id: { $ne: prompt._id }
            },
            { isActive: false }
        );

        // Activate this version
        prompt.isActive = true;
        await prompt.save();

        logger.info(`Prompt activated: ${prompt.name} v${prompt.version} by ${req.user.email}`);
        
        res.json({
            success: true,
            data: prompt,
            message: 'Prompt version activated successfully'
        });
    } catch (error) {
        logger.error('Error activating prompt:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get prompt versions
router.get('/:id/versions', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id);
        if (!prompt) {
            return res.status(404).json({
                success: false,
                error: { message: 'Prompt not found' }
            });
        }

        const versions = await Prompt.find({
            name: prompt.name,
            industry: prompt.industry
        })
        .populate('createdBy', 'email firstName lastName')
        .sort({ version: -1 });

        res.json({
            success: true,
            data: versions
        });
    } catch (error) {
        logger.error('Error fetching prompt versions:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get prompt performance metrics
router.get('/:id/metrics', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id);
        if (!prompt) {
            return res.status(404).json({
                success: false,
                error: { message: 'Prompt not found' }
            });
        }

        // This would integrate with your Resume model to get usage statistics
        // For now, returning mock data structure
        const metrics = {
            prompt: {
                name: prompt.name,
                version: prompt.version,
                industry: prompt.industry,
                isActive: prompt.isActive
            },
            usage: {
                totalEvaluations: 0,
                avgScore: 0,
                avgConfidence: 0,
                avgProcessingTime: 0
            },
            performance: {
                overrideRate: 0,
                avgOverrideTime: 0,
                avgOverrideScore: 0
            },
            trends: []
        };

        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        logger.error('Error fetching prompt metrics:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get industry-specific prompts
router.get('/industry/:industry', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { industry } = req.params;
        const { isActive } = req.query;

        const query = { industry };
        if (isActive !== undefined) {
            query.isActive = isActive;
        }

        const prompts = await Prompt.find(query)
            .populate('createdBy', 'email firstName lastName')
            .sort({ name: 1, version: -1 });

        // Group by prompt name and get latest version for each
        const groupedPrompts = {};
        prompts.forEach(prompt => {
            if (!groupedPrompts[prompt.name] || prompt.version > groupedPrompts[prompt.name].version) {
                groupedPrompts[prompt.name] = prompt;
            }
        });

        const latestPrompts = Object.values(groupedPrompts);

        res.json({
            success: true,
            data: latestPrompts
        });
    } catch (error) {
        logger.error('Error fetching industry prompts:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Prompt validation endpoint
router.post('/validate', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { promptText, industry } = req.body;

        if (!promptText || !industry) {
            return res.status(400).json({
                success: false,
                error: { message: 'Prompt text and industry are required' }
            });
        }

        // Basic validation rules
        const validation = {
            isValid: true,
            warnings: [],
            suggestions: []
        };

        // Check for required placeholders
        const requiredPlaceholders = ['{resume_content}', '{job_requirements}'];
        requiredPlaceholders.forEach(placeholder => {
            if (!promptText.includes(placeholder)) {
                validation.warnings.push(`Missing required placeholder: ${placeholder}`);
            }
        });

        // Check for industry-specific keywords
        const industryKeywords = {
            'IT': ['technology', 'programming', 'software', 'development'],
            'Healthcare': ['medical', 'healthcare', 'clinical', 'patient'],
            'Finance': ['financial', 'banking', 'investment', 'accounting'],
            'Manufacturing': ['manufacturing', 'production', 'operations', 'quality']
        };

        const keywords = industryKeywords[industry] || [];
        const hasIndustryKeywords = keywords.some(keyword => 
            promptText.toLowerCase().includes(keyword.toLowerCase())
        );

        if (!hasIndustryKeywords) {
            validation.suggestions.push(`Consider adding industry-specific keywords for ${industry}`);
        }

        // Check for clear evaluation criteria
        const evaluationKeywords = ['score', 'evaluate', 'assess', 'rate', 'grade'];
        const hasEvaluationCriteria = evaluationKeywords.some(keyword =>
            promptText.toLowerCase().includes(keyword.toLowerCase())
        );

        if (!hasEvaluationCriteria) {
            validation.warnings.push('Prompt should include clear evaluation criteria');
        }

        res.json({
            success: true,
            data: validation
        });
    } catch (error) {
        logger.error('Error validating prompt:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

module.exports = router;