
const express = require('express');
const router = express.Router();
const {
    getPromptsByIndustry,
    createPrompt,
    updatePrompt,
    deletePrompt
} = require('../controllers/promptController');

router.route('/industry/:industryId').get(getPromptsByIndustry);
router.route('/').post(createPrompt);
router.route('/:id').put(updatePrompt).delete(deletePrompt);

module.exports = router;
