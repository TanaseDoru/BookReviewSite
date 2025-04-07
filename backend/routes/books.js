const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Author = require('../models/Author');
const errorHandler = require('../utils/errorHandler');
const authMiddleware = require('../middleware/auth');
const isAuthor = require('../middleware/isAuthor');

const router = express.Router();

// Get all books or filter
router.get('/', async (req, res) => {
  try {
    let query = {};

    if (req.query.title) query.title = new RegExp(req.query.title, 'i');
    if (req.query.author) {
      // Căutăm autorul pe baza numelui pentru a obține authorId
      const author = await Author.findOne({ name: new RegExp(req.query.author, 'i') });
      if (author) {
        query.authorId = author._id;
      } else {
        return res.json([]); // Dacă autorul nu există, returnăm o listă goală
      }
    }
    if (req.query.genres) query.genres = new RegExp(req.query.genres, 'i');

    if (req.query.minPages || req.query.maxPages) {
      query.pages = {};
      if (req.query.minPages) query.pages.$gte = parseInt(req.query.minPages);
      if (req.query.maxPages) query.pages.$lte = parseInt(req.query.maxPages);
    }

    const books = await Book.find(query).populate('authorId');
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
    const book = await Book.findById(bookId).populate('authorId');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    errorHandler(res, error, 'Error fetching book');
  }
});

// Update a book by ID
router.put('/:bookId', authMiddleware, isAuthor, async (req, res) => {
  try {
    const { bookId } = req.params;
    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    const { title, genres, pages, coverImage, description } = req.body;

    // Construiește obiectul cu datele actualizate
    const updatedData = {};
    if (title) updatedData.title = title;
    if (genres) updatedData.genres = genres;
    if (pages) updatedData.pages = parseInt(pages);
    if (coverImage) updatedData.coverImage = coverImage;
    if (description) updatedData.description = description;

    // Actualizează cartea în baza de date
    const updatedBook = await Book.findByIdAndUpdate(bookId, updatedData, { new: true }).populate('authorId');
    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(updatedBook);
  } catch (error) {
    errorHandler(res, error, 'Error updating book');
  }
});

module.exports = router;