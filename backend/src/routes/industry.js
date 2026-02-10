const express = require('express');
const router = express.Router();
const { getIndustries, createIndustry, deleteIndustry } = require('../controllers/industryController');
const { authenticateToken: auth } = require('../middleware/auth');

router.use(auth);

router.route('/')
    .get(getIndustries)
    .post(createIndustry);

router.route('/:id')
    .delete(deleteIndustry);

module.exports = router;

