const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { authenticateToken: auth } = require('../middleware/auth');

// All queue routes are protected
router.use(auth);

// Get all applications for queue management
router.get('/applications', queueController.getAllApplications);

// Get queue statistics
router.get('/statistics', queueController.getQueueStatistics);

// Get applications by job ID
router.get('/applications/job/:jobId', queueController.getApplicationsByJob);

// Update application status
router.put('/applications/:id/status', queueController.updateApplicationStatus);

// Add note to application
router.post('/applications/:id/notes', queueController.addApplicationNote);

// Bulk update application statuses
router.put('/applications/bulk-status', queueController.bulkUpdateStatus);

module.exports = router;