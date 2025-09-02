const Component = require('../models/ComponentScema.js');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Get all components with optional search and filtering
const getComponents = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    
    // Build query object
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get components with pagination
    const components = await Component.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Component.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        components,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get components error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch components',
      error: error.message
    });
  }
};

// Get single component by ID
const getComponent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const component = await Component.findById(id)
      .populate('createdBy', 'firstName lastName email');
    
    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Component not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { component }
    });
  } catch (error) {
    console.error('Get component error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch component',
      error: error.message
    });
  }
};

// Create new component
const createComponent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { name, category, description, code, defaultProps, styles } = req.body;
    const createdBy = req.adminUser?.id || req.user?.id;
    
    // Handle thumbnail upload
    let thumbnailPath = null;
    if (req.file) {
      thumbnailPath = `/uploads/${req.file.filename}`;
    }
    
    // Process defaultProps to handle complex types
    let processedProps = [];
    try {
      const parsedProps = Array.isArray(defaultProps) ? defaultProps : [];
      processedProps = parsedProps.map(prop => {
        if (prop.type === 'object' && typeof prop.value === 'string') {
          try {
            JSON.parse(prop.value);
            return prop;
          } catch (e) {
            console.warn(`Invalid JSON for object prop ${prop.key}:`, prop.value);
            return { ...prop, value: '{}' };
          }
        }
        
        if (prop.type === 'array' && typeof prop.value === 'string') {
          try {
            const parsed = JSON.parse(prop.value);
            if (!Array.isArray(parsed)) {
              throw new Error('Not an array');
            }
            return prop;
          } catch (e) {
            console.warn(`Invalid JSON array for prop ${prop.key}:`, prop.value);
            return { ...prop, value: '[]' };
          }
        }
        
        return prop;
      });
    } catch (e) {
      console.error('Error processing defaultProps:', e);
      processedProps = [];
    }

    // Create new component
    const component = new Component({
      name,
      category: category || 'general',
      description,
      code,
      defaultProps: processedProps,
      styles: styles || {},
      thumbnail: thumbnailPath,
      createdBy
    });
    
    await component.save();
    
    // Populate creator info
    await component.populate('createdBy', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Component created successfully',
      data: { component }
    });
  } catch (error) {
    console.error('Create component error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create component',
      error: error.message
    });
  }
};

// Update component
const updateComponent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { name, category, description, code, defaultProps, styles, thumbnail } = req.body;
    
    const component = await Component.findById(id);
    
    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Component not found'
      });
    }
    
    // Update fields
    if (name !== undefined) component.name = name;
    if (category !== undefined) component.category = category;
    if (description !== undefined) component.description = description;
    if (code !== undefined) component.code = code;
    if (defaultProps !== undefined) {
      let parsedProps = [];
      try {
        // Parse defaultProps if it's a string
        parsedProps = typeof defaultProps === 'string' ? JSON.parse(defaultProps) : defaultProps;
        
        // Ensure it's an array
        if (!Array.isArray(parsedProps)) {
          parsedProps = [];
        }
        
        // Process each prop to handle complex types
        parsedProps = parsedProps.map(prop => {
          if (prop.type === 'object' && typeof prop.value === 'string') {
            try {
              // Validate that it's valid JSON
              JSON.parse(prop.value);
              return prop; // Keep as string for storage
            } catch (e) {
              console.warn(`Invalid JSON for object prop ${prop.key}:`, prop.value);
              return { ...prop, value: '{}' }; // Default to empty object
            }
          }
          
          if (prop.type === 'array' && typeof prop.value === 'string') {
            try {
              // Validate that it's valid JSON array
              const parsed = JSON.parse(prop.value);
              if (!Array.isArray(parsed)) {
                throw new Error('Not an array');
              }
              return prop; // Keep as string for storage
            } catch (e) {
              console.warn(`Invalid JSON array for prop ${prop.key}:`, prop.value);
              return { ...prop, value: '[]' }; // Default to empty array
            }
          }
          
          return prop;
        });
        
        component.defaultProps = parsedProps;
      } catch (e) {
        console.error('Error parsing defaultProps:', e);
        component.defaultProps = [];
      }
    }
    if (styles !== undefined) component.styles = styles;
    
    // Handle thumbnail upload
    console.log('Backend: req.file:', req.file);
    console.log('Backend: req.body:', req.body);
    console.log('Backend: FormData keys:', Object.keys(req.body));
    
    if (req.file) {
      console.log('Backend: File received - filename:', req.file.filename, 'size:', req.file.size);
      // Delete old thumbnail file if it exists
      if (component.thumbnail) {
        const oldFilePath = path.join(__dirname, '..', '..', component.thumbnail);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log('Backend: Old thumbnail deleted:', oldFilePath);
        }
      }
      component.thumbnail = `/uploads/${req.file.filename}`;
      console.log('Backend: New thumbnail path set:', component.thumbnail);
    } else {
      console.log('Backend: No file received in request');
    }
    
    component.updatedAt = new Date();
    
    await component.save();
    await component.populate('createdBy', 'firstName lastName email');
    
    res.status(200).json({
      success: true,
      message: 'Component updated successfully',
      data: { component }
    });
  } catch (error) {
    console.error('Update component error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update component',
      error: error.message
    });
  }
};

// Delete component
const deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const component = await Component.findById(id);
    
    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Component not found'
      });
    }
    
    await Component.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Component deleted successfully'
    });
  } catch (error) {
    console.error('Delete component error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete component',
      error: error.message
    });
  }
};

// Get component categories
const getCategories = async (req, res) => {
  try {
    const categories = await Component.distinct('category');
    
    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

module.exports = {
  getComponents,
  getComponent,
  createComponent,
  updateComponent,
  deleteComponent,
  getCategories
};