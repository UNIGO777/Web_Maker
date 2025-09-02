const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  const user = new User({
    firstName,
    lastName,
    email,
    password
  });

  await user.save();

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    }
  });
};

exports.me = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
};

exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  }

  // Check if user has admin role
  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Admin account is deactivated'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Admin login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    }
  });
};

exports.adminMe = async (req, res) => {
  // Check if the authenticated user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  res.json({
    success: true,
    message: 'Admin profile retrieved successfully',
    data: { 
      user: req.user,
      permissions: ['read', 'write', 'delete', 'manage_users', 'manage_projects', 'system_admin']
    }
  });
};


