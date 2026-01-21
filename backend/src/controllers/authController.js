const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Create user (password will be hashed automatically by the pre-save middleware)
    const user = new User({
      email,
      password,
      personalInfo: {
        firstName,
        lastName
      }
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error during registration'
      }
    });
  }
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Account has been disabled'
        }
      });
    }

    // Check password using the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    logger.info(`User logged in: ${email}`);

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        role: user.role,
        department: user.personalInfo.department
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error during login'
      }
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      personalInfo: {
        firstName: user.personalInfo.firstName,
        lastName: user.personalInfo.lastName,
        email: user.email,
        phone: user.personalInfo.phone,
        department: user.personalInfo.department,
        position: user.personalInfo.position,
        location: user.personalInfo.location,
        bio: user.personalInfo.bio
      },
      professionalInfo: {
        joinDate: user.professionalInfo.joinDate,
        totalEvaluations: user.professionalInfo.totalEvaluations,
        successfulPlacements: user.professionalInfo.successfulPlacements,
        averageTimeToHire: user.professionalInfo.averageTimeToHire,
        specializations: user.professionalInfo.specializations,
        certifications: user.professionalInfo.certifications,
        languages: user.professionalInfo.languages
      },
      performance: {
        quarterlyScore: user.performance.quarterlyScore,
        candidateSatisfaction: user.performance.candidateSatisfaction,
        hiringManagerRating: user.performance.hiringManagerRating,
        efficiencyScore: user.performance.efficiencyScore,
        qualityScore: user.performance.qualityScore,
        trend: user.performance.trend
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error fetching profile'
      }
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // In a real implementation, you would invalidate the token here
    // For now, we'll just return success
    logger.info(`User logged out: ${req.user.id}`);
    
    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error during logout'
      }
    });
  }
};
