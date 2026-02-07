const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken: auth } = require('../middleware/auth');
const resumeController = require('../controllers/resumeController');

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'text/plain'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOCX, and TXT are allowed.'), false);
        }
    }
});

// POST /api/resume/parse
router.post('/parse', auth, upload.single('resume'), resumeController.parseResume);

// POST /api/resume/evaluate
router.post('/evaluate', auth, resumeController.evaluateResume);

// GET /api/resume - Get all resumes (with optional filters)
router.get('/', auth, resumeController.getResumes);

// PUT /api/resume/bulk-status - Bulk update status
router.put('/bulk-status', auth, resumeController.bulkUpdateResumeStatus);

// PUT /api/resume/:id/status - Update single resume status
router.put('/:id/status', auth, resumeController.updateResumeStatus);

module.exports = router;
