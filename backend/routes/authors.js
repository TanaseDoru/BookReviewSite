// routes/authors.js
const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

// Get all authors (distinct authors from books)
router.get('/', async (req, res) => {
  try {
    const authors = await Book.distinct('author');
    res.json(authors);
  } catch (error) {
    errorHandler(res, error, 'Error fetching authors');
  }
});

// Get author by name (returns books by that author)
router.get('/name/:name', async (req, res) => {
  try {
    const authorName = req.params.name;
    const books = await Book.find({ author: new RegExp(authorName, 'i') });

    if (!books.length) return res.status(404).json({ message: 'Author not found' });

    res.json(books);
  } catch (error) {
    errorHandler(res, error, 'Error fetching author by name');
  }
});

module.exports = router;