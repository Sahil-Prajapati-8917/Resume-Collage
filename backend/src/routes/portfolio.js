const express = require('express');
const router = express.Router();
const { updatePortfolio } = require('../controllers/portfolioController');

// All routes here are protected
router.put('/', updatePortfolio);

module.exports = router;
