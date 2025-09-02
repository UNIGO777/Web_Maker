const express = require('express');
const { body } = require('express-validator');
const { validate, handleAsync } = require('../middleware/validate');
const { auth, optionalAuth } = require('../middleware/auth');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

// @route   GET /api/portfolio/:username
// @desc    Get public portfolio by username
// @access  Public
router.get('/:username', optionalAuth, handleAsync(portfolioController.getPublicByUsername));

// @route   GET /api/portfolio
// @desc    Get current user's portfolio
// @access  Private
router.get('/', auth, handleAsync(portfolioController.getMine));

// @route   POST /api/portfolio
// @desc    Create new portfolio
// @access  Private
router.post('/', [
  auth,
  body('personalInfo.headline')
    .notEmpty()
    .withMessage('Headline is required')
    .isLength({ max: 200 })
    .withMessage('Headline cannot exceed 200 characters'),
  body('personalInfo.summary')
    .notEmpty()
    .withMessage('Summary is required')
    .isLength({ max: 1000 })
    .withMessage('Summary cannot exceed 1000 characters')
], validate, handleAsync(portfolioController.create));

// @route   PUT /api/portfolio
// @desc    Update portfolio
// @access  Private
router.put('/', [
  auth,
  body('personalInfo.headline')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Headline cannot exceed 200 characters'),
  body('personalInfo.summary')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Summary cannot exceed 1000 characters')
], validate, handleAsync(portfolioController.update));

// @route   POST /api/portfolio/projects
// @desc    Add project to portfolio
// @access  Private
router.post('/projects', [
  auth,
  body('title')
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ max: 100 })
    .withMessage('Project title cannot exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 500 })
    .withMessage('Project description cannot exceed 500 characters'),
  body('technologies')
    .isArray()
    .withMessage('Technologies must be an array'),
  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),
  body('liveUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid live URL')
], validate, handleAsync(portfolioController.addProject));

// @route   PUT /api/portfolio/projects/:projectId
// @desc    Update project in portfolio
// @access  Private
router.put('/projects/:projectId', [
  auth,
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Project title cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Project description cannot exceed 500 characters'),
  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),
  body('liveUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid live URL')
], validate, handleAsync(portfolioController.updateProject));

// @route   DELETE /api/portfolio/projects/:projectId
// @desc    Delete project from portfolio
// @access  Private
router.delete('/projects/:projectId', auth, handleAsync(portfolioController.deleteProject));

// @route   PUT /api/portfolio/visibility
// @desc    Toggle portfolio visibility
// @access  Private
router.put('/visibility', [
  auth,
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
], validate, handleAsync(portfolioController.toggleVisibility));

module.exports = router;

