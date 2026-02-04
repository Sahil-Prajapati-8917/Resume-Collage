const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken: auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const signupValidation = [];

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', signupValidation, authController.signup);

// @route   POST /api/auth/login
// @desc    Authenticate user
// @access  Public
router.post('/login', loginValidation, authController.login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', authController.refresh);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, authController.getProfile);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, authController.logout);

module.exports = router;
