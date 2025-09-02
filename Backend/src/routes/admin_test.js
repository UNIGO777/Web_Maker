const express = require('express');
const { adminAuth } = require('../middleware/auth');
const { handleAsync } = require('../middleware/validate');
const adminController = require('../controllers/adminController');
const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin test route working' });
});

// Test one admin controller function
router.get('/stats', handleAsync(adminController.getStats));

module.exports = router;