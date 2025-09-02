const express = require('express');
const { adminAuth } = require('../middleware/auth');
const { handleAsync } = require('../middleware/validate');
const adminController = require('../controllers/adminController');

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', handleAsync(adminController.getStats));

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', handleAsync(adminController.getAllUsers));

// @route   GET /api/admin/projects
// @desc    Get all projects
// @access  Private/Admin
router.get('/projects', handleAsync(adminController.getAllProjects));

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', handleAsync(adminController.updateUserRole));

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', handleAsync(adminController.deleteUser));

// @route   DELETE /api/admin/projects/:id
// @desc    Delete project
// @access  Private/Admin
router.delete('/projects/:id', handleAsync(adminController.deleteProject));

// @route   GET /api/admin/recent-activity
// @desc    Get recent activity
// @access  Private/Admin
router.get('/recent-activity', handleAsync(adminController.getRecentActivity));

// @route   GET /api/admin/system-health
// @desc    Get system health
// @access  Private/Admin
router.get('/system-health', handleAsync(adminController.getSystemHealth));

module.exports = router;