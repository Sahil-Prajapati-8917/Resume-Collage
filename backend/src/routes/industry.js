const express = require('express');
const router = express.Router();
const { getIndustries, createIndustry, deleteIndustry } = require('../controllers/industryController');

router.route('/')
    .get(getIndustries)
    .post(createIndustry);

router.route('/:id')
    .delete(deleteIndustry);

module.exports = router;
