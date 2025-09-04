const Website = require('../models/Website');
const Project = require('../models/Project');

// @desc    Get website by project ID
// @route   GET /api/websites/project/:projectId
// @access  Private
exports.getWebsiteByProject = async (req, res) => {
  try {
    // First verify the project belongs to the user
    const project = await Project.findOne({
      _id: req.params.projectId,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const website = await Website.findOne({ project: req.params.projectId });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Sort components by sequence before returning
    if (website.components && website.components.length > 0) {
      website.components.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    }

    res.json({
      success: true,
      data: { website }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching website',
      error: error.message
    });
  }
};

// @desc    Update website
// @route   PUT /api/websites/:id
// @access  Private
exports.updateWebsite = async (req, res) => {
  try {
    const { logo, seo, components } = req.body;

    // Find the website and verify ownership through project
    const website = await Website.findById(req.params.id).populate('project');

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Verify the project belongs to the user
    if (website.project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this website'
      });
    }

    const updateData = {};
    if (logo !== undefined) updateData.logo = logo;
    if (seo !== undefined) updateData.seo = { ...website.seo, ...seo };
    if (components !== undefined) updateData.components = components;

    const updatedWebsite = await Website.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Website updated successfully',
      data: { website: updatedWebsite }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating website',
      error: error.message
    });
  }
};

// @desc    Update website SEO
// @route   PUT /api/websites/:id/seo
// @access  Private
exports.updateWebsiteSEO = async (req, res) => {
  try {
    const { title, description, keywords, canonicalUrl, ogImage, ogTitle, ogDescription } = req.body;

    // Find the website and verify ownership through project
    const website = await Website.findById(req.params.id).populate('project');

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Verify the project belongs to the user
    if (website.project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this website'
      });
    }

    const seoUpdate = {};
    if (title !== undefined) seoUpdate['seo.title'] = title;
    if (description !== undefined) seoUpdate['seo.description'] = description;
    if (keywords !== undefined) seoUpdate['seo.keywords'] = keywords;
    if (canonicalUrl !== undefined) seoUpdate['seo.canonicalUrl'] = canonicalUrl;
    if (ogImage !== undefined) seoUpdate['seo.ogImage'] = ogImage;
    if (ogTitle !== undefined) seoUpdate['seo.ogTitle'] = ogTitle;
    if (ogDescription !== undefined) seoUpdate['seo.ogDescription'] = ogDescription;

    const updatedWebsite = await Website.findByIdAndUpdate(
      req.params.id,
      seoUpdate,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Website SEO updated successfully',
      data: { website: updatedWebsite }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating website SEO',
      error: error.message
    });
  }
};

// @desc    Update website components
// @route   PUT /api/websites/:id/components
// @access  Private
exports.updateWebsiteComponents = async (req, res) => {
  try {
    const { components } = req.body;

    // Find the website and verify ownership through project
    const website = await Website.findById(req.params.id).populate('project');

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Verify the project belongs to the user
    if (website.project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this website'
      });
    }

    const updatedWebsite = await Website.findByIdAndUpdate(
      req.params.id,
      { components },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Website components updated successfully',
      data: { website: updatedWebsite }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating website components',
      error: error.message
    });
  }
};

// @desc    Get website by ID
// @route   GET /api/websites/:id
// @access  Private
exports.getWebsite = async (req, res) => {
  try {
    const website = await Website.findById(req.params.id).populate('project');

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Verify the project belongs to the user
    if (website.project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this website'
      });
    }

    // Sort components by sequence before returning
    if (website.components && website.components.length > 0) {
      website.components.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    }

    res.json({
      success: true,
      data: { website }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching website',
      error: error.message
    });
  }
};