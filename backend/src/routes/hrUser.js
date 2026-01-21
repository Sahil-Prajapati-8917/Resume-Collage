const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Company = require('../models/Company');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');

// Create HR user (Company Admin or Master Admin)
router.post('/', authenticateToken, authorizeRoles(['company_admin', 'master_admin']), async (req, res) => {
    try {
        const { 
            email, 
            password, 
            firstName, 
            lastName, 
            phone, 
            department, 
            position, 
            role, 
            company: companyId 
        } = req.body;

        // Validate company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(400).json({
                success: false,
                error: { message: 'Company not found' }
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: { message: 'User with this email already exists' }
            });
        }

        // Validate role permissions
        const validRoles = ['recruiter', 'hr_manager', 'company_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid role specified' }
            });
        }

        // Create user
        const user = new User({
            email,
            password,
            personalInfo: {
                firstName,
                lastName,
                phone,
                department,
                position
            },
            company: company._id,
            role
        });

        // Set permissions based on role
        user.permissions = getRolePermissions(role);

        await user.save();

        logger.info(`HR user created: ${user.email} in company ${company.name} by ${req.user.email}`);
        
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                email: user.email,
                personalInfo: user.personalInfo,
                role: user.role,
                company: company.name,
                permissions: user.permissions
            }
        });
    } catch (error) {
        logger.error('Error creating HR user:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get all HR users for a company
router.get('/', authenticateToken, authorizeRoles(['company_admin', 'master_admin', 'ops_admin']), async (req, res) => {
    try {
        const { companyId, page = 1, limit = 10, role, status } = req.query;
        
        const query = {};
        
        // Master admin can see all companies, others see only their company
        if (req.user.role === 'master_admin' || req.user.role === 'ops_admin') {
            if (companyId) query.company = companyId;
        } else {
            query.company = req.user.company;
        }
        
        if (role) query.role = role;
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;

        const users = await User.find(query)
            .populate('company', 'name industry')
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('Error fetching HR users:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Get HR user by ID
router.get('/:id', authenticateToken, authorizeRoles(['company_admin', 'master_admin', 'ops_admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('company', 'name industry');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: { message: 'User not found' }
            });
        }

        // Check if user belongs to same company (unless master admin)
        if (req.user.role !== 'master_admin' && req.user.role !== 'ops_admin') {
            if (user.company._id.toString() !== req.user.company.toString()) {
                return res.status(403).json({
                    success: false,
                    error: { message: 'Access denied' }
                });
            }
        }

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                password: undefined // Never return password
            }
        });
    } catch (error) {
        logger.error('Error fetching HR user:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Update HR user
router.put('/:id', authenticateToken, authorizeRoles(['company_admin', 'master_admin']), async (req, res) => {
    try {
        const { firstName, lastName, phone, department, position, role, isActive } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { message: 'User not found' }
            });
        }

        // Check permissions
        if (req.user.role !== 'master_admin') {
            if (user.company.toString() !== req.user.company.toString()) {
                return res.status(403).json({
                    success: false,
                    error: { message: 'Access denied' }
                });
            }
        }

        // Update fields
        if (firstName) user.personalInfo.firstName = firstName;
        if (lastName) user.personalInfo.lastName = lastName;
        if (phone) user.personalInfo.phone = phone;
        if (department) user.personalInfo.department = department;
        if (position) user.personalInfo.position = position;
        if (role) {
            user.role = role;
            user.permissions = getRolePermissions(role);
        }
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        logger.info(`HR user updated: ${user.email} by ${req.user.email}`);
        
        res.json({
            success: true,
            data: {
                ...user.toObject(),
                password: undefined
            }
        });
    } catch (error) {
        logger.error('Error updating HR user:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Delete HR user (deactivate)
router.delete('/:id', authenticateToken, authorizeRoles(['company_admin', 'master_admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { message: 'User not found' }
            });
        }

        // Check permissions
        if (req.user.role !== 'master_admin') {
            if (user.company.toString() !== req.user.company.toString()) {
                return res.status(403).json({
                    success: false,
                    error: { message: 'Access denied' }
                });
            }
        }

        // Don't allow deleting the primary HR of a company
        const company = await Company.findById(user.company);
        if (company.primaryHR && company.primaryHR.toString() === user._id.toString()) {
            return res.status(400).json({
                success: false,
                error: { message: 'Cannot delete primary HR user of a company' }
            });
        }

        user.isActive = false;
        await user.save();

        logger.info(`HR user deactivated: ${user.email} by ${req.user.email}`);
        
        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        logger.error('Error deactivating HR user:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Bulk import HR users
router.post('/bulk-import', authenticateToken, authorizeRoles(['company_admin', 'master_admin']), async (req, res) => {
    try {
        const { companyId, users } = req.body;

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid users data' }
            });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(400).json({
                success: false,
                error: { message: 'Company not found' }
            });
        }

        const createdUsers = [];
        const errors = [];

        for (const userData of users) {
            try {
                const { email, password, firstName, lastName, role } = userData;

                // Check if user already exists
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    errors.push({ email, error: 'User already exists' });
                    continue;
                }

                const user = new User({
                    email,
                    password,
                    personalInfo: {
                        firstName,
                        lastName
                    },
                    company: company._id,
                    role
                });

                user.permissions = getRolePermissions(role);
                await user.save();

                createdUsers.push({
                    email: user.email,
                    firstName: user.personalInfo.firstName,
                    lastName: user.personalInfo.lastName,
                    role: user.role
                });
            } catch (error) {
                errors.push({ email: userData.email, error: error.message });
            }
        }

        logger.info(`Bulk import completed: ${createdUsers.length} users created, ${errors.length} errors by ${req.user.email}`);
        
        res.json({
            success: true,
            data: {
                created: createdUsers,
                errors,
                summary: {
                    total: users.length,
                    created: createdUsers.length,
                    failed: errors.length
                }
            }
        });
    } catch (error) {
        logger.error('Error bulk importing HR users:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
});

// Helper function to get role permissions
function getRolePermissions(role) {
    const basePermissions = {
        canCreateHiringForms: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canManagePrompts: false,
        canAccessAudit: false,
        canManageCompanies: false
    };

    switch (role) {
        case 'recruiter':
            return {
                ...basePermissions,
                canCreateHiringForms: true,
                canViewAnalytics: true
            };
        case 'hr_manager':
            return {
                ...basePermissions,
                canCreateHiringForms: true,
                canManageUsers: true,
                canViewAnalytics: true,
                canAccessAudit: true
            };
        case 'company_admin':
            return {
                ...basePermissions,
                canCreateHiringForms: true,
                canManageUsers: true,
                canViewAnalytics: true,
                canAccessAudit: true
            };
        default:
            return basePermissions;
    }
}

module.exports = router;