const express = require('express');
const { body } = require('express-validator');
const { validate, handleAsync } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const projectController = require('../controllers/projectController');



const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/projects
// @desc    Get all projects for authenticated user
// @access  Private
router.get('/', handleAsync(projectController.getProjects));

// @route   GET /api/projects/:id
// @desc    Get single project by ID
// @access  Private
router.get('/:id', handleAsync(projectController.getProject));

// @route   POST /api/projects/upload
// @desc    Upload thumbnail image
// @access  Private
router.post('/upload', upload.single('thumbnail'), handleAsync(projectController.uploadThumbnail));

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', upload.single('thumbnail'), [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
], validate, handleAsync(projectController.createProject));

// @route   POST /api/projects/test
// @desc    Test project creation without validation
// @access  Private
router.post('/test', upload.single('thumbnail'), handleAsync(projectController.createProject));

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('thumbnail')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid thumbnail URL'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  body('design.theme')
    .optional()
    .isIn(['light', 'dark', 'custom'])
    .withMessage('Theme must be light, dark, or custom'),
  body('design.palette.primary')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Primary color must be a valid hex color'),
  body('design.palette.secondary')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Secondary color must be a valid hex color'),
  body('design.palette.accent')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Accent color must be a valid hex color'),
], validate, handleAsync(projectController.updateProject));

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', handleAsync(projectController.deleteProject));

// @route   PATCH /api/projects/:id/publish
// @desc    Publish project
// @access  Private
router.patch('/:id/publish', handleAsync(projectController.publishProject));

// @route   POST /api/projects/:id/duplicate
// @desc    Duplicate project
// @access  Private
router.post('/:id/duplicate', handleAsync(projectController.duplicateProject));

module.exports = router;
