const Portfolio = require('../models/Portfolio');

// @desc    Get portfolio data
// @route   GET /api/public/portfolio
// @access  Public
exports.getPortfolio = async (req, res) => {
    try {
        // Assuming single user portfolio for now, or fetch by some ID if needed.
        // For a personal portfolio, we often just want the "main" one.
        // We'll fetch the most recently updated one or valid one.
        const portfolio = await Portfolio.findOne().sort({ lastUpdated: -1 });

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio data not found'
            });
        }

        res.status(200).json({
            success: true,
            data: portfolio
        });
    } catch (err) {
        console.error('Get portfolio error:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error: Failed to fetch portfolio data',
            error: err.message
        });
    }
};

// @desc    Update or Create portfolio data
// @route   PUT /api/portfolio
// @access  Private (Admin)
exports.updatePortfolio = async (req, res) => {
    try {
        const portfolioData = req.body;

        // Try to find existing portfolio to update
        let portfolio = await Portfolio.findOne();

        if (portfolio) {
            // Update existing
            portfolio = await Portfolio.findByIdAndUpdate(portfolio._id, portfolioData, {
                new: true,
                runValidators: true
            });
        } else {
            // Create new
            portfolio = await Portfolio.create(portfolioData);
        }

        res.status(200).json({
            success: true,
            data: portfolio,
            message: 'Portfolio updated successfully'
        });
    } catch (err) {
        console.error('Update portfolio error:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error: Failed to update portfolio',
            error: err.message
        });
    }
};
