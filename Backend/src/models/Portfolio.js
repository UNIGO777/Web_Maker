const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Project title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [500, 'Project description cannot exceed 500 characters']
  },
  image: {
    type: String,
    default: ''
  },
  technologies: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    trim: true
  },
  liveUrl: {
    type: String,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    headline: {
      type: String,
      required: [true, 'Headline is required'],
      maxlength: [200, 'Headline cannot exceed 200 characters']
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      maxlength: [1000, 'Summary cannot exceed 1000 characters']
    },
    location: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    instagram: String,
    facebook: String
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'database', 'devops', 'other'],
      default: 'other'
    }
  }],
  experience: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    location: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      maxlength: [500, 'Experience description cannot exceed 500 characters']
    }
  }],
  education: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    field: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    },
    description: String
  }],
  projects: [projectSchema],
  isPublic: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'custom'],
    default: 'light'
  },
  customColors: {
    primary: String,
    secondary: String,
    accent: String
  }
}, {
  timestamps: true
});

// Index for better query performance
portfolioSchema.index({ user: 1 });
portfolioSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);

