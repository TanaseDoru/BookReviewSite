// routes/users.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const errorHandler = require('../utils/errorHandler');
const User = require('../models/User');

const router = express.Router();

// Fetch users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).lean();

    return res.json(users);
  } catch (error) {
    errorHandler(res, error, 'Error fetching users');
  }
});

//Fetch User name by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 }).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    errorHandler(res, error, 'Error fetching user');
  }
});



module.exports = router;