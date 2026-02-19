const SystemSettings = require('../models/SystemSettings');
const logger = require('../utils/logger');

// Get system settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();

        if (!settings) {
            // Create default settings if not exists
            settings = await SystemSettings.create({});
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        logger.error('Error fetching system settings:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
};

// Update system settings
exports.updateSettings = async (req, res) => {
    try {
        const { general, features, security, notifications, maintenance } = req.body;

        let settings = await SystemSettings.findOne();

        if (!settings) {
            settings = new SystemSettings({});
        }

        if (general) settings.general = { ...settings.general, ...general };
        if (features) settings.features = { ...settings.features, ...features };
        if (security) settings.security = { ...settings.security, ...security };
        if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
        if (maintenance) settings.maintenance = { ...settings.maintenance, ...maintenance };

        settings.updatedBy = req.user._id;

        await settings.save();

        logger.info(`System settings updated by ${req.user.email}`);

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        logger.error('Error updating system settings:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error' }
        });
    }
};
