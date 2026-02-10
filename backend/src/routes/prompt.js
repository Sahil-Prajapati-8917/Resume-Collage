const express = require('express');
const router = express.Router();
const {
    getPromptsByIndustry,
    createPrompt,
    updatePrompt,
    deletePrompt
} = require('../controllers/promptController');
const { authenticateToken: auth } = require('../middleware/auth');

router.use(auth);

router.route('/industry/:industryId').get(getPromptsByIndustry);
router.route('/').post(createPrompt);
router.route('/:id').put(updatePrompt).delete(deletePrompt);

module.exports = router;
