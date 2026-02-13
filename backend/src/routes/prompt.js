const express = require('express');
const router = express.Router();
const {
    getPromptsByIndustry,
    getAllPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt
} = require('../controllers/promptController');
const { authenticateToken: auth } = require('../middleware/auth');

router.use(auth);

router.route('/').get(getAllPrompts).post(createPrompt);
router.route('/:id').put(updatePrompt).delete(deletePrompt);

module.exports = router;
