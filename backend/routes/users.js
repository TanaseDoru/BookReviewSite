// routes/users.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const errorHandler = require('../utils/errorHandler');

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



module.exports = router;