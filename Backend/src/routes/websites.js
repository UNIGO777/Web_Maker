const express = require('express');
const router = express.Router();
const {
  getWebsiteByProject,
  updateWebsite,
  updateWebsiteSEO,
  updateWebsiteComponents,
  getWebsite
} = require('../controllers/websiteController');
const { auth } = require('../middleware/auth');

// All routes are protected
router.use(auth);

// @route   GET /api/websites/project/:projectId
// @desc    Get website by project ID
// @access  Private
router.get('/project/:projectId', getWebsiteByProject);

// @route   GET /api/websites/:id
// @desc    Get website by ID
// @access  Private
router.get('/:id', getWebsite);

// @route   PUT /api/websites/:id
// @desc    Update website
// @access  Private
router.put('/:id', updateWebsite);

// @route   PUT /api/websites/:id/seo
// @desc    Update website SEO
// @access  Private
router.put('/:id/seo', updateWebsiteSEO);

// @route   PUT /api/websites/:id/components
// @desc    Update website components
// @access  Private
router.put('/:id/components', updateWebsiteComponents);

module.exports = router;