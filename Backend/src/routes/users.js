const express = require('express');
const { body } = require('express-validator');
const { validate, handleAsync } = require('../middleware/validate');
const { auth, adminAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, handleAsync(userController.getProfile));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL')
], validate, handleAsync(userController.updateProfile));

// @route   PUT /api/users/avatar
// @desc    Update user avatar
// @access  Private
router.put('/avatar', [
  auth,
  body('avatar')
    .notEmpty()
    .withMessage('Avatar URL is required')
    .isURL()
    .withMessage('Please provide a valid avatar URL')
], validate, handleAsync(userController.updateAvatar));

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', [
  auth,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], validate, handleAsync(userController.changePassword));

// @route   DELETE /api/users/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile', auth, handleAsync(userController.deleteProfile));

// @route   GET /api/users (Admin only)
// @desc    Get all users
// @access  Private/Admin
router.get('/', adminAuth, handleAsync(userController.getAllUsers));

// @route   PUT /api/users/:id/status (Admin only)
// @desc    Update user status
// @access  Private/Admin
router.put('/:id/status', [
  adminAuth,
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
], validate, handleAsync(userController.updateUserStatus));

module.exports = router;

