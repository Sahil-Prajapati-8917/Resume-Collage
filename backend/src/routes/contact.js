const express = require('express');
const router = express.Router();
const { getAllContacts, deleteContact } = require('../controllers/contactController');
const { authorizeRoles } = require('../middleware/auth');

// All routes here are protected and require admin role
router.get('/', authorizeRoles('admin'), getAllContacts);
router.delete('/:id', authorizeRoles('admin'), deleteContact);

module.exports = router;
