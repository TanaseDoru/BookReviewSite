// routes/authors.js
const express = require('express');
const Author = require('../models/Author');
const Book = require('../models/Book');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

// Get all authors from the authors collection
router.get('/', async (req, res) => {
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (error) {
    errorHandler(res, error, 'Error fetching authors');
  }
});

// Get author by name (returns author details and their books)
router.get('/name/:name', async (req, res) => {
  try {
    const authorName = req.params.name;
    // Căutăm autorul în colecția authors (ignorăm majusculele)
    const author = await Author.findOne({ name: new RegExp(authorName, 'i') });

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Găsim cărțile scrise de acest autor folosind authorId
    const books = await Book.find({ authorId: author._id }).populate('authorId');

    // Returnăm detaliile autorului și cărțile sale
    res.json({
      author,
      books,
    });
  } catch (error) {
    errorHandler(res, error, 'Error fetching author by name');
  }
});

router.put('/updatePicture/:id', async (req, res) => {
  try {
    const authorId = req.params.id;
    const { picture } = req.body;

    if (!picture) {
      return res.status(400).json({ message: 'Picture is required' });
    }

    const updatedAuthor = await Author.findByIdAndUpdate(
      authorId,
      { picture },
      { new: true }
    );

    if (!updatedAuthor) {
      return res.status(404).json({ message: 'Author not found' });
    }

    res.status(200).json({ message: 'Author picture updated successfully', author: updatedAuthor });
  } catch (error) {
    errorHandler(res, error, 'Error updating author picture');
  }
});

// Adăugăm ruta GET /:id
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    // Găsim cărțile scrise de acest autor folosind authorId
    const books = await Book.find({ authorId: author._id }).populate('authorId');
    res.json({
      author,
      books,
    });
  } catch (error) {
    errorHandler(res, error, 'Error fetching author by ID');
  }
});

module.exports = router;