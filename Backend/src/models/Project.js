const mongoose = require('mongoose');

// Block/Section schema used by the website builder


const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    trim: true,
    maxlength: 120,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  thumbnail: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true,
  },
  design: {
    theme: { type: String, enum: ['light', 'dark', 'custom'], default: 'light' },
    palette: {
      primary: { type: String, default: '#3B82F6' },
      secondary: { type: String, default: '#10B981' },
      accent: { type: String, default: '#1F2937' },
    },
    typography: {
      fontFamily: { type: String, default: 'Inter, sans-serif' },
      baseSize: { type: Number, default: 16 },
    },
  },
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website'
  },
  isPublic: { type: Boolean, default: true },
  publishedAt: { type: Date },
  version: { type: Number, default: 1 },
}, {
  timestamps: true,
});


module.exports = mongoose.model('Project', projectSchema);

 