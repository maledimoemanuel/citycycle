const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRE 
    });
    res.status(201).json({ success: true, token });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRE 
  });
  res.status(200).json({ success: true, token });
};

module.exports = { register, login };