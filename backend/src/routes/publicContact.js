const express = require('express');
const router = express.Router();
const { createContact } = require('../controllers/contactController');

// Public route to send a message
router.post('/', createContact);

module.exports = router;
