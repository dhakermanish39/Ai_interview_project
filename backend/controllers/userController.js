const User = require('../models/User');

// GET Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    console.log('Fetching profile for user:', req.user.email, 'Profile found:', !!user);
    if (!user) {
      console.log('User not found for email:', req.user.email);
      return res.status(404).json({ message: 'User not found' });
    }
console.log('Profile data sent for user:', req.user.email, 'Name:', user.name, 'Target Role:', user.target_role);
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile for user:', req.user.email, 'Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, target_role, college, experience_level } = req.body;
console.log('Updating profile for user:', req.user.email, 'New Data:', { name, target_role, college, experience_level });
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, target_role, college, experience_level },
      { new: true }
    ).select('-password_hash');
console.log('Profile updated for user:', req.user.email, 'Updated Data:', { name: updated.name, target_role: updated.target_role, college: updated.college, experience_level: updated.experience_level });
    res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    console.error('Error updating profile for user:', req.user.email, 'Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};