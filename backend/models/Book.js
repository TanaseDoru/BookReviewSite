// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  coverImage: { type: String, trim: true },
  genres: [{ type: String, trim: true }],
  pages: { type: Number, min: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);