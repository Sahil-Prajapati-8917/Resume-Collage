const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');

// Create a new company (Master Admin only)
router.post('/', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { name, industry, companySize, primaryHR, subscriptionPlan } = req.body;

        // Check if company already exists
        const existingCompany = await Company.findOne({ name });
        if (existingCompany) {
            return res.status(400).json({ 
                success: false, 
                error: { message: 'Company with this name already exists' } 
            });
        }

        // Check if primary HR user exists and is not already assigned
        let primaryHRUser = null;
        if (primaryHR) {
            primaryHRUser = await User.findById(primaryHR);
            if (!primaryHRUser) {
                return res.status(400).json({ 
                    success: false, 
                    error: { message: 'Primary HR user not found' } 
                });
            }
            if (primaryHRUser.company) {
                return res.status(400).json({ 
                    success: false, 
                    error: { message: 'Primary HR user is already assigned to another company' } 
                });
            }
        }

        // Create company
        const company = new Company({
            name,
            industry,
            companySize,
            primaryHR: primaryHRUser?._id,
            subscriptionPlan
        });

        await company.save();

        // Update primary HR user if provided
        if (primaryHRUser) {
            primaryHRUser.company = company._id;
            primaryHRUser.role = 'company_admin';
            primaryHRUser.permissions = {
                canCreateHiringForms: true,
                canManageUsers: true,
                canViewAnalytics: true,
                canManagePrompts: false,
                canAccessAudit: true,
                canManageCompanies: false
            };
            await primaryHRUser.save();
        }

        logger.info(`Company created: ${company.name} by ${req.user.email}`);
        
        res.status(201).json({
            success: true,
            data: company
        });
    } catch (error) {
        logger.error('Error creating company:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get all companies with pagination and filtering
router.get('/', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { page = 1, limit = 10, industry, status, search } = req.query;
        
        const query = {};
        
        if (industry) query.industry = industry;
        if (status) query.status = status;
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const companies = await Company.find(query)
            .populate('primaryHR', 'email firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Company.countDocuments(query);

        res.json({
            success: true,
            data: companies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('Error fetching companies:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get company by ID
router.get('/:id', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
            .populate('primaryHR', 'email firstName lastName');

        if (!company) {
            return res.status(404).json({
                success: false,
                error: { message: 'Company not found' }
            });
        }

        res.json({
            success: true,
            data: company
        });
    } catch (error) {
        logger.error('Error fetching company:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Update company
router.put('/:id', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const { industry, companySize, subscriptionPlan, status, settings } = req.body;

        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({
                success: false,
                error: { message: 'Company not found' }
            });
        }

        // Update fields
        if (industry) company.industry = industry;
        if (companySize) company.companySize = companySize;
        if (subscriptionPlan) company.subscriptionPlan = subscriptionPlan;
        if (status) company.status = status;
        if (settings) company.settings = { ...company.settings, ...settings };

        await company.save();

        logger.info(`Company updated: ${company.name} by ${req.user.email}`);
        
        res.json({
            success: true,
            data: company
        });
    } catch (error) {
        logger.error('Error updating company:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Delete company (soft delete)
router.delete('/:id', authenticateToken, authorizeRoles(['master_admin']), async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({
                success: false,
                error: { message: 'Company not found' }
            });
        }

        // Soft delete - set status to inactive
        company.status = 'inactive';
        await company.save();

        // Deactivate all users in the company
        await User.updateMany(
            { company: company._id },
            { isActive: false }
        );

        logger.info(`Company deactivated: ${company.name} by ${req.user.email}`);
        
        res.json({
            success: true,
            message: 'Company deactivated successfully'
        });
    } catch (error) {
        logger.error('Error deactivating company:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get company analytics
router.get('/:id/analytics', authenticateToken, authorizeRoles(['master_admin', 'ops_admin']), async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({
                success: false,
                error: { message: 'Company not found' }
            });
        }

        // Get company users count
        const userCount = await User.countDocuments({ 
            company: company._id, 
            isActive: true 
        });

        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentActivity = {
            totalUsers: userCount,
            activeUsers: await User.countDocuments({ 
                company: company._id, 
                lastLogin: { $gte: thirtyDaysAgo },
                isActive: true
            }),
            usage: company.usage
        };

        res.json({
            success: true,
            data: {
                company: {
                    name: company.name,
                    industry: company.industry,
                    companySize: company.companySize,
                    subscriptionPlan: company.subscriptionPlan,
                    status: company.status
                },
                analytics: recentActivity
            }
        });
    } catch (error) {
        logger.error('Error fetching company analytics:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

module.exports = router;