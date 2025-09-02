const Portfolio = require('../models/Portfolio');
const User = require('../models/User');

exports.getPublicByUsername = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ email: username });
  if (!user) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }
  const portfolio = await Portfolio.findOne({ user: user._id, isPublic: true })
    .populate('user', 'firstName lastName email avatar');
  if (!portfolio) {
    return res.status(404).json({ success: false, message: 'Portfolio not found or not public' });
  }
  res.json({ success: true, data: { portfolio } });
};

exports.getMine = async (req, res) => {
  const portfolio = await Portfolio.findOne({ user: req.user._id });
  if (!portfolio) {
    return res.status(404).json({ success: false, message: 'Portfolio not found. Please create one first.' });
  }
  res.json({ success: true, data: { portfolio } });
};

exports.create = async (req, res) => {
  const existingPortfolio = await Portfolio.findOne({ user: req.user._id });
  if (existingPortfolio) {
    return res.status(400).json({ success: false, message: 'Portfolio already exists for this user' });
  }
  const portfolioData = { user: req.user._id, ...req.body };
  const portfolio = new Portfolio(portfolioData);
  await portfolio.save();
  res.status(201).json({ success: true, message: 'Portfolio created successfully', data: { portfolio } });
};

exports.update = async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!portfolio) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }
  res.json({ success: true, message: 'Portfolio updated successfully', data: { portfolio } });
};

exports.addProject = async (req, res) => {
  const portfolio = await Portfolio.findOne({ user: req.user._id });
  if (!portfolio) {
    return res.status(404).json({ success: false, message: 'Portfolio not found. Please create one first.' });
  }
  portfolio.projects.push(req.body);
  await portfolio.save();
  res.status(201).json({ success: true, message: 'Project added successfully', data: { project: portfolio.projects[portfolio.projects.length - 1] } });
};

exports.updateProject = async (req, res) => {
  const { projectId } = req.params;
  const portfolio = await Portfolio.findOne({ user: req.user._id });
  if (!portfolio) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }
  const projectIndex = portfolio.projects.findIndex(project => project._id.toString() === projectId);
  if (projectIndex === -1) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      portfolio.projects[projectIndex][key] = req.body[key];
    }
  });
  await portfolio.save();
  res.json({ success: true, message: 'Project updated successfully', data: { project: portfolio.projects[projectIndex] } });
};

exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const portfolio = await Portfolio.findOne({ user: req.user._id });
  if (!portfolio) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }
  portfolio.projects = portfolio.projects.filter(project => project._id.toString() !== projectId);
  await portfolio.save();
  res.json({ success: true, message: 'Project deleted successfully' });
};

exports.toggleVisibility = async (req, res) => {
  const { isPublic } = req.body;
  const portfolio = await Portfolio.findOneAndUpdate(
    { user: req.user._id },
    { isPublic },
    { new: true }
  );
  if (!portfolio) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }
  res.json({ success: true, message: `Portfolio is now ${isPublic ? 'public' : 'private'}`, data: { portfolio } });
};


