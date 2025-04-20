const express = require('express');
const Notification = require('../models/Notifications');
const authMiddleware = require('../middleware/auth');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

// Create a new notification (when a user requests to become an author)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { details } = req.body;

    // Validate inputs
    if (!details) {
      return res.status(400).json({ message: 'Details are required' });
    }

    // Create a new notification
    const notification = new Notification({
      userId: req.user.userId, // The authenticated user making the request
      details,
      status: 'pending',
    });

    await notification.save();
    const populatedNotification = await Notification.findById(notification._id)
      .populate('userId', 'firstName lastName email');

    res.status(201).json(populatedNotification);
  } catch (error) {
    errorHandler(res, error, 'Error creating notification');
  }
});

// Get all notifications (for admin to view)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required' });
    }

    const notifications = await Notification.find()
      .populate('userId', 'firstName lastName email')
      .sort({ requestDate: -1 });

    res.json(notifications);
  } catch (error) {
    errorHandler(res, error, 'Error fetching notifications');
  }
});

// Get notifications for the authenticated user
router.get('/my-notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .populate('userId', 'firstName lastName email')
      .sort({ requestDate: -1 });

    res.json(notifications);
  } catch (error) {
    errorHandler(res, error, 'Error fetching user notifications');
  }
});

// backend/routes/notifications.js
router.get('/check', authMiddleware, async (req, res) => {
    try {
      const notification = await Notification
        .findOne({ userId: req.user.userId })
        .sort({ requestDate: -1 });
  
      if (!notification) {
        return res.json({ hasRequest: false });
      }
      const response = {
        hasRequest: true,
        status: notification.status,
        requestedAt: notification.requestDate
      };
      return res.json(response);
    } catch (error) {
      errorHandler(res, error, 'Error checking pending notification');
    }
  });
  
module.exports = router;