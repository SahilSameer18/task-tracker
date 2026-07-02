const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '4d',
  });
};

/**
 * @desc    Register new user
 * @route   POST /api/users
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      const token = generateToken(user._id);

      // Set cookie options
      const isProd = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
      };

      res.cookie('token', token, cookieOptions);

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Authenticate a user
 * @route   POST /api/users/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);

      // Set cookie options
      const isProd = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
      };

      res.cookie('token', token, cookieOptions);

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/users/logout
 */
const logoutUser = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user data
 * @route   GET /api/users/me
 */
const getMe = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
};
