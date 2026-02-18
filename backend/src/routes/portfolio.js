const express = require('express');
const router = express.Router();
const { updatePortfolio } = require('../controllers/portfolioController');
const { authorizeRoles } = require('../middleware/auth');

// All routes here are protected and require admin role
router.put('/', authorizeRoles('admin'), updatePortfolio);

module.exports = router;
