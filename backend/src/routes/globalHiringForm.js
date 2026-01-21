const express = require('express');
const router = express.Router();
const HiringForm = require('../models/HiringForm');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');

// Create global hiring form template (Master Admin only)
router.post('/', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { 
            name, 
            industry, 
            roleType, 
            experienceLevel, 
            evaluationWeights, 
            cutOffThresholds, 
            isActive 
        } = req.body;

        // Check if form already exists with same name
        const existingForm = await HiringForm.findOne({ name });
        if (existingForm) {
            return res.status(400).json({
                success: false,
                error: { message: 'Hiring form with this name already exists' }
            });
        }

        const form = new HiringForm({
            name,
            industry,
            roleType,
            experienceLevel,
            evaluationWeights,
            cutOffThresholds,
            isActive: isActive !== false,
            isGlobal: true,
            createdBy: req.user._id
        });

        await form.save();

        logger.info(`Global hiring form created: ${form.name} by ${req.user.email}`);
        
        res.status(201).json({
            success: true,
            data: form
        });
    } catch (error) {
        logger.error('Error creating global hiring form:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get all global hiring forms
router.get('/', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { page = 1, limit = 10, industry, roleType, isActive } = req.query;
        
        const query = { isGlobal: true };
        
        if (industry) query.industry = industry;
        if (roleType) query.roleType = roleType;
        if (isActive !== undefined) query.isActive = isActive;

        const forms = await HiringForm.find(query)
            .populate('createdBy', 'email firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await HiringForm.countDocuments(query);

        res.json({
            success: true,
            data: forms,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('Error fetching global hiring forms:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get global hiring form by ID
router.get('/:id', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const form = await HiringForm.findById(req.params.id)
            .populate('createdBy', 'email firstName lastName');

        if (!form) {
            return res.status(404).json({
                success: false,
                error: { message: 'Hiring form not found' }
            });
        }

        if (!form.isGlobal) {
            return res.status(400).json({
                success: false,
                error: { message: 'This is not a global hiring form' }
            });
        }

        res.json({
            success: true,
            data: form
        });
    } catch (error) {
        logger.error('Error fetching global hiring form:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Update global hiring form
router.put('/:id', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { 
            name, 
            industry, 
            roleType, 
            experienceLevel, 
            evaluationWeights, 
            cutOffThresholds, 
            isActive 
        } = req.body;

        const form = await HiringForm.findById(req.params.id);
        if (!form) {
            return res.status(404).json({
                success: false,
                error: { message: 'Hiring form not found' }
            });
        }

        if (!form.isGlobal) {
            return res.status(400).json({
                success: false,
                error: { message: 'Cannot modify non-global hiring form' }
            });
        }

        // Update fields
        if (name) form.name = name;
        if (industry) form.industry = industry;
        if (roleType) form.roleType = roleType;
        if (experienceLevel) form.experienceLevel = experienceLevel;
        if (evaluationWeights) form.evaluationWeights = evaluationWeights;
        if (cutOffThresholds) form.cutOffThresholds = cutOffThresholds;
        if (isActive !== undefined) form.isActive = isActive;

        form.updatedAt = new Date();
        await form.save();

        logger.info(`Global hiring form updated: ${form.name} by ${req.user.email}`);
        
        res.json({
            success: true,
            data: form
        });
    } catch (error) {
        logger.error('Error updating global hiring form:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Delete global hiring form (soft delete)
router.delete('/:id', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const form = await HiringForm.findById(req.params.id);
        if (!form) {
            return res.status(404).json({
                success: false,
                error: { message: 'Hiring form not found' }
            });
        }

        if (!form.isGlobal) {
            return res.status(400).json({
                success: false,
                error: { message: 'Cannot delete non-global hiring form' }
            });
        }

        form.isActive = false;
        await form.save();

        logger.info(`Global hiring form deactivated: ${form.name} by ${req.user.email}`);
        
        res.json({
            success: true,
            message: 'Hiring form deactivated successfully'
        });
    } catch (error) {
        logger.error('Error deactivating global hiring form:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Clone global hiring form
router.post('/:id/clone', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const form = await HiringForm.findById(req.params.id);
        if (!form) {
            return res.status(404).json({
                success: false,
                error: { message: 'Hiring form not found' }
            });
        }

        if (!form.isGlobal) {
            return res.status(400).json({
                success: false,
                error: { message: 'Cannot clone non-global hiring form' }
            });
        }

        const clonedForm = new HiringForm({
            name: `${form.name} (Clone)`,
            industry: form.industry,
            roleType: form.roleType,
            experienceLevel: form.experienceLevel,
            evaluationWeights: form.evaluationWeights,
            cutOffThresholds: form.cutOffThresholds,
            isActive: true,
            isGlobal: true,
            createdBy: req.user._id
        });

        await clonedForm.save();

        logger.info(`Global hiring form cloned: ${clonedForm.name} from ${form.name} by ${req.user.email}`);
        
        res.status(201).json({
            success: true,
            data: clonedForm
        });
    } catch (error) {
        logger.error('Error cloning global hiring form:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get industry-specific templates
router.get('/templates/:industry', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { industry } = req.params;
        const { roleType } = req.query;

        const query = { 
            isGlobal: true, 
            isActive: true,
            industry 
        };

        if (roleType) {
            query.roleType = roleType;
        }

        const templates = await HiringForm.find(query)
            .select('name industry roleType experienceLevel evaluationWeights cutOffThresholds')
            .sort({ roleType: 1, experienceLevel: 1 });

        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        logger.error('Error fetching industry templates:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

module.exports = router;