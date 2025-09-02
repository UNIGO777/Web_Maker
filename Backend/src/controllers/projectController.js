const Project = require('../models/Project');
const Website = require('../models/Website');
const path = require('path');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalProjects = await Project.countDocuments({ user: req.user._id });
    
    // Get projects with pagination and populate website
    const projects = await Project.find({ user: req.user._id })
      .populate('website')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProjects / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: { 
        projects,
        pagination: {
          currentPage: page,
          totalPages,
          totalProjects,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// @desc    Upload thumbnail image
// @route   POST /api/projects/upload
// @access  Private
exports.uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate the file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const { name, description, design, isPublic } = req.body;
    let thumbnail = req.body.thumbnail;

    // If a file was uploaded, use the uploaded file URL
    if (req.file) {
      thumbnail = `/uploads/${req.file.filename}`;
    }

    console.log("Creating project with data:", { name, description, thumbnail, design, isPublic });

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create website document first
    const website = new Website({
      project: null, // Will be set after project creation
      seo: {
        title: name || 'My Website',
        description: description || 'A beautiful website built with our platform'
      },
      components: []
    });
    await website.save();

    const projectData = {
      user: req.user._id,
      name,
      slug,
      description,
      thumbnail,
      design,
      isPublic,
      website: website._id
    };

    const project = new Project(projectData);
    await project.save();

    // Update website with project reference
    website.project = project._id;
    await website.save();

    // Populate the website field before returning
    await project.populate('website');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const { name, description, thumbnail, design, isPublic, status } = req.body;

    const updateData = {
      name,
      description,
      thumbnail,
      design,
      isPublic,
      status
    };

    // Generate new slug if name changed
    if (name) {
      updateData.slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Set publishedAt if status changes to published
    if (status === 'published' && !req.body.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

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

// @desc    Publish project
// @route   PATCH /api/projects/:id/publish
// @access  Private
exports.publishProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { 
        status: 'published',
        publishedAt: new Date(),
        version: { $inc: 1 }
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project published successfully',
      data: { project }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error publishing project',
      error: error.message
    });
  }
};

// @desc    Duplicate project
// @route   POST /api/projects/:id/duplicate
// @access  Private
exports.duplicateProject = async (req, res) => {
  try {
    const originalProject = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!originalProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const duplicatedProject = new Project({
      ...originalProject.toObject(),
      _id: undefined,
      name: `${originalProject.name} (Copy)`,
      slug: `${originalProject.slug}-copy`,
      status: 'draft',
      publishedAt: undefined,
      createdAt: undefined,
      updatedAt: undefined
    });

    await duplicatedProject.save();

    res.status(201).json({
      success: true,
      message: 'Project duplicated successfully',
      data: { project: duplicatedProject }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error duplicating project',
      error: error.message
    });
  }
};
