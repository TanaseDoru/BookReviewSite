const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  details: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['accepted', 'denied', 'pending'],
    default: 'pending',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);