const User = require('../models/User');

// GET /api/user/profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.address) user.address = { ...user.address.toObject?.() || user.address, ...req.body.address };
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    const { password: _, ...userData } = updated.toObject();
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile };
