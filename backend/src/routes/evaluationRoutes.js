const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
// const { protect } = require('../middleware/authMiddleware'); // Uncomment if auth is needed

// router.use(protect); // Apply to all routes

router.post('/bulk', evaluationController.startBulkEvaluation);
router.get('/progress/:jobId', evaluationController.getJobProgress);
router.get('/results/:jobId', evaluationController.getEvaluationResults);

module.exports = router;
