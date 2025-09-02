const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getComponents,
  getComponent,
  createComponent,
  updateComponent,
  deleteComponent,
  getCategories
} = require('../controllers/componentController.js');
const { adminAuth } = require('../middleware/auth.js');
const upload = require('../middleware/upload');

const router = express.Router();

// Middleware to parse JSON fields from multipart/form-data
const parseMultipartJSON = (req, res, next) => {
  if (req.body.defaultProps && typeof req.body.defaultProps === 'string') {
    try {
      req.body.defaultProps = JSON.parse(req.body.defaultProps);
    } catch (error) {
      req.body.defaultProps = [];
    }
  }
  if (req.body.styles && typeof req.body.styles === 'string') {
    try {
      req.body.styles = JSON.parse(req.body.styles);
    } catch (error) {
      req.body.styles = {};
    }
  }
  next();
};

// Validation middleware for component creation/update
const componentValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Component name must be between 1 and 100 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('code')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Component code is required'),
  body('defaultProps')
    .optional()
    .isArray()
    .withMessage('Default props must be an array'),
  body('styles')
    .optional()
    .isObject()
    .withMessage('Styles must be an object')
];

// Public routes (for viewing components)
router.get('/', getComponents);
router.get('/categories', getCategories);
router.get('/:id', getComponent);

// Protected routes (admin only)
router.post('/', adminAuth, upload.single('thumbnail'), parseMultipartJSON, componentValidation, createComponent);
router.put('/:id', adminAuth, upload.single('thumbnail'), parseMultipartJSON, componentValidation, updateComponent);
router.delete('/:id', adminAuth, deleteComponent);

module.exports = router;