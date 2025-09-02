const User = require('../models/User');

exports.getProfile = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

exports.updateProfile = async (req, res) => {
  const { firstName, lastName, phone, website } = req.body;
  const updateFields = {};
  if (firstName) updateFields.firstName = firstName;
  if (lastName) updateFields.lastName = lastName;
  if (phone) updateFields.phone = phone;
  if (website) updateFields.website = website;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateFields,
    { new: true, runValidators: true }
  );
  res.json({ success: true, message: 'Profile updated successfully', data: { user } });
};

exports.updateAvatar = async (req, res) => {
  const { avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true }
  );
  res.json({ success: true, message: 'Avatar updated successfully', data: { user } });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
};

exports.deleteProfile = async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account deleted successfully' });
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json({ success: true, count: users.length, data: { users } });
};

exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  ).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, message: 'User status updated successfully', data: { user } });
};


