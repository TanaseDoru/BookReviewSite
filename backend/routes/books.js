// backend/routes/books.js
const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

// Get all books or filter
router.get('/', async (req, res) => {
  try {
    let query = {};

    if (req.query.title) query.title = new RegExp(req.query.title, 'i');
    if (req.query.author) query.author = new RegExp(req.query.author, 'i');
    if (req.query.genres) query.genres = new RegExp(req.query.genres, 'i');

    if (req.query.minPages || req.query.maxPages) {
      query.pages = {};
      if (req.query.minPages) query.pages.$gte = parseInt(req.query.minPages);
      if (req.query.maxPages) query.pages.$lte = parseInt(req.query.maxPages);
    }

    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    errorHandler(res, error, 'Error fetching books');
  }
});

// Get all distinct genres by fetching all books
router.get('/genres', async (req, res) => {
  try {
    const books = await Book.find({}).select('genres');
    if (!books || books.length === 0) {
      return res.status(200).json([]);
    }
    const allGenres = books
      .filter((book) => Array.isArray(book.genres))
      .flatMap((book) => book.genres);
    const distinctGenres = [...new Set(allGenres)];
    distinctGenres.sort();
    res.json(distinctGenres);
  } catch (error) {
    errorHandler(res, error, 'Error fetching genres');
  }
});

// Get a book by ID
router.get('/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    errorHandler(res, error, 'Error fetching book');
  }
});



module.exports = router;