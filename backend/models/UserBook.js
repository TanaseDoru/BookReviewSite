// models/UserBook.js
const mongoose = require('mongoose');

const userBookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  status: {
    type: String,
    enum: ['Vreau sa citesc', 'Citesc', 'Citit'],
    default: 'Vreau sa citesc',
  },
  dateAdded: { type: Date, default: Date.now },
  dateRead: { type: Date, default: null },
  rating: { type: Number, min: 1, max: 5, default: null },
}, { timestamps: true });

module.exports = mongoose.model('UserBook', userBookSchema);