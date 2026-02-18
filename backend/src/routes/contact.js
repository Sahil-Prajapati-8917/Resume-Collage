const express = require('express');
const router = express.Router();
const { getAllContacts, deleteContact } = require('../controllers/contactController');

// All routes here are protected by authenticateToken middleware in server.js
router.get('/', getAllContacts);
router.delete('/:id', deleteContact);

module.exports = router;
