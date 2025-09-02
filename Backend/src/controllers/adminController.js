const User = require('../models/User');
const Project = require('../models/Project');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total projects
    const totalProjects = await Project.countDocuments();
    
    // Get active users (users who have logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // For now, we'll use total users as active users
    // In a real app, you'd track last login time
    const activeUsers = totalUsers;
    
    // Calculate growth rate (placeholder - in real app, compare with previous period)
    const growthRate = 15; // Placeholder percentage
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        activeUsers,
        growthRate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics',
      error: error.message
    });
  }
};

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get all projects (admin view)
// @route   GET /api/admin/projects
// @access  Private (Admin only)
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Also delete all projects by this user
    await Project.deleteMany({ user: req.params.id });

    res.json({
      success: true,
      message: 'User and associated projects deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/admin/recent-activity
// @access  Private/Admin
const getRecentActivity = async (req, res) => {
  try {
    // Get recent users (last 7 days)
    const recentUsers = await User.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).select('firstName lastName email createdAt').sort({ createdAt: -1 }).limit(5);

    // Get recent projects (last 7 days)
    const recentProjects = await Project.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).populate('user', 'firstName lastName').select('name createdAt user').sort({ createdAt: -1 }).limit(5);

    // Format activity data
    const activities = [];

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        type: 'user_registered',
        message: `${user.firstName} ${user.lastName} registered`,
        timestamp: user.createdAt,
        user: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        }
      });
    });

    // Add project creations
    recentProjects.forEach(project => {
      activities.push({
        id: `project-${project._id}`,
        type: 'project_created',
        message: `New project "${project.name}" created`,
        timestamp: project.createdAt,
        user: {
          name: `${project.user.firstName} ${project.user.lastName}`
        },
        project: {
          title: project.name
        }
      });
    });

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: activities.slice(0, 10) // Return top 10 activities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};

// @desc    Get system health
// @route   GET /api/admin/system-health
// @access  Private/Admin
const getSystemHealth = async (req, res) => {
  try {
    // Database health
    const dbHealth = {
      status: 'healthy',
      connections: 0,
      responseTime: 0
    };

    // Test database connection
    const dbStart = Date.now();
    try {
      await User.countDocuments();
      dbHealth.responseTime = Date.now() - dbStart;
      dbHealth.status = dbHealth.responseTime < 100 ? 'healthy' : 'slow';
    } catch (error) {
      dbHealth.status = 'error';
      dbHealth.error = error.message;
    }

    // Server health
    const serverHealth = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
        percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: os.loadavg()
      }
    };

    // Storage health
    const storageHealth = {
      status: 'healthy',
      usage: 0,
      available: 0,
      percentage: 0
    };

    try {
      const uploadsPath = path.join(__dirname, '../../uploads');
      const stats = await fs.stat(uploadsPath);
      const files = await fs.readdir(uploadsPath);
      
      let totalSize = 0;
      for (const file of files) {
        if (file !== '.gitkeep') {
          const filePath = path.join(uploadsPath, file);
          const fileStats = await fs.stat(filePath);
          totalSize += fileStats.size;
        }
      }
      
      storageHealth.usage = totalSize / 1024 / 1024; // MB
      storageHealth.files = files.length - 1; // Exclude .gitkeep
    } catch (error) {
      storageHealth.status = 'error';
      storageHealth.error = error.message;
    }

    res.status(200).json({
      success: true,
      data: {
        database: dbHealth,
        server: serverHealth,
        storage: storageHealth,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system health',
      error: error.message
    });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  getAllProjects,
  updateUserRole,
  deleteUser,
  deleteProject,
  getRecentActivity,
  getSystemHealth
};
