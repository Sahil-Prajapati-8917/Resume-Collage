const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all evaluation routes
router.use(authenticateToken);

// Test route
router.get('/ping', (req, res) => res.json({ success: true, message: 'Evaluation API is reachable', user: req.user._id }));

router.post('/bulk', evaluationController.startBulkEvaluation);
router.post('/queue/all', evaluationController.evaluateAllQueued);
router.get('/progress/:jobId', evaluationController.getJobProgress);
router.get('/results/:jobId', evaluationController.getEvaluationResults);

module.exports = router;
