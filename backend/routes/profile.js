// routes/profile.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const upload = require('../utils/multerConfig');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, { password: 0 });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    errorHandler(res, error, 'Error fetching user profile');
  }
});

// Get profile picture
router.get('/picture', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, { profilePicture: 1 });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ profilePicture: user.profilePicture || null });
  } catch (error) {
    errorHandler(res, error, 'Error fetching profile picture');
  }
});

// Get profile picture by user ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(userId, { profilePicture: 1 });
    if (!user || !user.profilePicture) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    res.json({ profilePicture: user.profilePicture });
  } catch (error) {
    errorHandler(res, error, 'Error fetching profile picture');
  }
});

// Update user profile (first name, last name)
router.put('/update-name', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const result = await User.updateOne(
      { _id: req.user.userId },
      { $set: { firstName, lastName } }
    );

    if (result.modifiedCount === 0) {
      return res.json({ message: 'No changes made' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    errorHandler(res, error, 'Error updating profile');
  }
});

router.put('/update-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Parola a fost actualizată cu succes' });
  } catch (err) {
    console.error('Eroare la actualizarea parolei:', err);
    res.status(500).json({ message: 'Eroare server' });
  }
});

// Upload profile picture
router.post('/upload-picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageBuffer = req.file.buffer.toString('base64');
    const result = await User.updateOne(
      { _id: req.user.userId },
      { $set: { profilePicture: imageBuffer } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }

    res.json({ message: 'Profile picture uploaded successfully', profilePicture: imageBuffer });
  } catch (error) {
    errorHandler(res, error, 'Error uploading profile picture');
  }
});

module.exports = router;