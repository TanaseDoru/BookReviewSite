// routes/userBooks.js
const express = require('express');
const UserBook = require('../models/UserBook');
const Book = require('../models/Book');
const authMiddleware = require('../middleware/auth');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

// Fetch user books
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userBooks = await UserBook.find({ userId: req.user.userId })
      .populate('bookId')
      .sort({ dateAdded: -1 })
      .lean();
    res.json(userBooks);
  } catch (error) {
    errorHandler(res, error, 'Error fetching user books');
  }
});

// Add a book to user’s list
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { bookId, status } = req.body;

    if (!bookId || !status) {
      return res.status(400).json({ message: 'Book ID and status are required' });
    }

    const bookExists = await Book.findById(bookId);
    if (!bookExists) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const userBook = new UserBook({
      userId: req.user.userId,
      bookId,
      status,
      dateAdded: new Date(),
    });

    await userBook.save();
    const populatedUserBook = await UserBook.findById(userBook._id).populate('bookId').lean();
    res.status(201).json(populatedUserBook);
  } catch (error) {
    errorHandler(res, error, 'Error adding book');
  }
});

// Update book status or rating
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rating } = req.body;

    const userBook = await UserBook.findOne({ _id: id, userId: req.user.userId });
    if (!userBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (status) userBook.status = status;
    if (rating) userBook.rating = rating;
    if (status === 'Citit' && !userBook.dateRead) userBook.dateRead = new Date();

    await userBook.save();
    res.json(userBook);
  } catch (error) {
    errorHandler(res, error, 'Error updating book');
  }
});

module.exports = router;