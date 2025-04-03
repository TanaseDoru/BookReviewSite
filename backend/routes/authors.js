// routes/authors.js
const express = require('express');
const Author = require('../models/Author'); // Importăm modelul Author
const Book = require('../models/Book'); // Păstrăm Book pentru a găsi cărțile autorului
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

// Get all authors from the authors collection
router.get('/', async (req, res) => {
  try {
    const authors = await Author.find(); // Obținem toți autorii din colecția authors
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

    // Găsim cărțile scrise de acest autor în colecția books
    const books = await Book.find({ author: new RegExp(authorName, 'i') });

    // Returnăm detaliile autorului și cărțile sale
    res.json({
      author,
      books,
    });
  } catch (error) {
    errorHandler(res, error, 'Error fetching author by name');
  }
});

// Adăugăm ruta GET /:id
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    // Găsim cărțile scrise de acest autor folosind numele său
    const books = await Book.find({ author: new RegExp(author.name, 'i') });
    res.json({
      author,
      books,
    });
  } catch (error) {
    errorHandler(res, error, 'Error fetching author by ID');
  }
});

module.exports = router;