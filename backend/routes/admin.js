const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Author = require('../models/Author');
const Review = require('../models/Review');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();
router.use(authMiddleware);

// Statistici
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required. Your role is: ' + req.user.role });
    }
    const booksWithMostReviews = await Review.aggregate([
      { $group: { _id: '$bookId', reviewCount: { $sum: 1 } } },
      { $sort: { reviewCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { title: '$book.title', reviewCount: 1 } },
    ]);

    const booksWithHighestRating = await Book.find()
      .sort({ avgRating: -1 })
      .limit(5)
      .select('title avgRating')
      .populate('authorId');

    const reviewsWithMostLikes = await Review.find()
      .sort({ likes: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName')
      .populate('bookId', 'title')
      .select('description likes bookId userId');

    const usersWithMostReviews = await Review.aggregate([
      { $group: { _id: '$userId', reviewCount: { $sum: 1 } } },
      { $sort: { reviewCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { firstName: '$user.firstName', lastName: '$user.lastName', reviewCount: 1 } },
    ]);

    res.json({
      booksWithMostReviews,
      booksWithHighestRating,
      reviewsWithMostLikes,
      usersWithMostReviews,
    });
  } catch (error) {
    errorHandler(res, error, 'Error fetching site stats');
  }
});

// Adăugare carte
router.post('/books', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'author') {
      return res.status(403).json({ message: 'Admin or Author role required. Your role is: ' + req.user.role });
    }

    const { title, authorId, genres, pages, coverImage, description } = req.body;


    // Verificăm dacă authorId este valid
    if (!mongoose.isValidObjectId(authorId)) {
      return res.status(400).json({ message: 'Invalid author ID:' + authorId });
    }

    const newBook = new Book({
      title,
      authorId: authorId, // Folosim authorId în loc de author
      genres,
      pages,
      coverImage,
      description,
    });
    console.log('Adding Book: ', newBook);
    await newBook.save();
    const populatedBook = await Book.findById(newBook._id).populate('authorId');
    res.status(201).json(populatedBook);
  } catch (error) {
    errorHandler(res, error, 'Error adding book');
  }
});

// Adăugare autor
router.post('/authors', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required. Your role is: ' + req.user.role });
    }
    const { name, picture, born, isAlive, died, genres, description } = req.body;
    const newAuthor = new Author({
      name,
      picture,
      born,
      isAlive,
      died,
      genres,
      description,
    });
    await newAuthor.save();
    res.status(201).json(newAuthor);
  } catch (error) {
    errorHandler(res, error, 'Error adding author');
  }
});

// Listare utilizatori și căutare după email
router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required. Your role is: ' + req.user.role });
    }
    const { email } = req.query;
    const query = email ? { email: new RegExp(email, 'i') } : {};
    const users = await User.find(query).select('firstName lastName email role');
    res.json(users);
  } catch (error) {
    errorHandler(res, error, 'Error fetching users');
  }
});

// Actualizare rol utilizator
router.patch('/users/:id/role', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required. Your role is: ' + req.user.role });
    }

    const { role } = req.body;

    if (!['admin', 'user', 'author'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role === 'author') {
      const authorName = `${user.firstName} ${user.lastName}`;
      let author = await Author.findOne({ name: new RegExp(`^${authorName}$`, 'i') });

      if (!author) {
        author = new Author({
          name: authorName,
          picture: user.profilePicture || '',
        });
        await author.save();
      }

      user.authorId = author._id;
    } else {
      user.authorId = null;
    }

    user.role = role;
    await user.save();

    res.json(user);
  } catch (error) {
    errorHandler(res, error, 'Error updating user role');
  }
});

// Listare cereri pentru a deveni autor
router.get('/author-requests', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required. Your role is: ' + req.user.role });
    }
    const requests = await User.find({ role: 'user', authorId: { $exists: true } })
      .populate('authorId', 'name')
      .select('firstName lastName email authorId');
    res.json(requests);
  } catch (error) {
    errorHandler(res, error, 'Error fetching author requests');
  }
});

// Aprobare cerere pentru a deveni autor
router.post('/author-requests/:id/approve', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required. Your role is: ' + req.user.role });
    }
    const { authorId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = 'author';
    user.authorId = authorId;
    await user.save();
    res.json(user);
  } catch (error) {
    errorHandler(res, error, 'Error approving author request');
  }
});

// Respingere cerere pentru a deveni autor
router.delete('/author-requests/:id/reject', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required. Your role is: ' + req.user.role });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.authorId = undefined;
    await user.save();
    res.json({ message: 'Author request rejected' });
  } catch (error) {
    errorHandler(res, error, 'Error rejecting author request');
  }
});

router.put('/authors/:id/updateName', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin or Author role required. Your role is: ' + req.user.role });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    author.name = name;
    await author.save();

    return res.json({ message: 'Author name updated successfully', author });
  } catch (error) {
    errorHandler(res, error, 'Error updating author name');
  }
});

router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (user.role === 'author') {
    const books = await Book.find({ authorId: user.authorId });
    const bookIds = books.map(book => book._id);
    await Review.deleteMany({ bookId: { $in: bookIds } });
    await Book.deleteMany({ authorId: user.authorId });
  }
  await User.deleteOne({ _id: userId });
  res.status(200).json({ message: 'User deleted' });
});

module.exports = router;