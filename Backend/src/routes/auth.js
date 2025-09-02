const express = require('express');
const { body } = require('express-validator');
const { validate, handleAsync } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], validate, handleAsync(authController.register));

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], validate, handleAsync(authController.login));

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, handleAsync(authController.me));

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, authController.logout);

// @route   POST /api/auth/admin/login
// @desc    Admin login with role validation
// @access  Public
router.post('/admin/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], validate, handleAsync(authController.adminLogin));

// @route   GET /api/auth/admin/me
// @desc    Get current admin profile
// @access  Private/Admin
router.get('/admin/me', auth, handleAsync(authController.adminMe));

module.exports = router;

