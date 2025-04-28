// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Corect: folosim newUser în loc de user
    const token = jwt.sign(
      { userId: user._id, firstName: user.firstName, lastName: user.lastName, role: user.role, email: user.email, authorId: user.authorId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: '✅ Account created successfully!', token, firstName: newUser.firstName });
  } catch (error) {
    errorHandler(res, error, '❌ Error during registration');
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Verificăm dacă utilizatorul este activ
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, firstName: user.firstName, lastName: user.lastName, role: user.role, email: user.email, authorId: user.authorId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Trimite toate datele relevante despre utilizator
    res.json({
      message: '✅ Login successful!',
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        role: user.role,
        authorId: user.authorId
      }
    });
  } catch (error) {
    errorHandler(res, error, '❌ Error during login');
  }
});

module.exports = router;
