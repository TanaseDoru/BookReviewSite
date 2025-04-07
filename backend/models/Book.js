// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Author', // Referință la colecția "Author"
    required: true 
  },
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  coverImage: { type: String, trim: true },
  genres: [{ type: String, trim: true }],
  pages: { type: Number, min: 1 },
  description: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);