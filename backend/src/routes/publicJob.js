const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getPublicJob, applyForJob } = require('../controllers/publicJobController');

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

router.get('/:id', getPublicJob);
router.post('/:id/apply', upload.single('resume'), applyForJob);

module.exports = router;
