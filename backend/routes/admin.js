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
    if(req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required. Your role is: ' + req.user.role });
    }
    // Cărțile cu cele mai multe review-uri
    const booksWithMostReviews = await Review.aggregate([
      { $group: { _id: '$bookId', reviewCount: { $sum: 1 } } },
      { $sort: { reviewCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { title: '$book.title', reviewCount: 1 } },
    ]);

    // Cărțile cu cel mai mare rating
    const booksWithHighestRating = await Book.find()
      .sort({ avgRating: -1 })
      .limit(5)
      .select('title avgRating');

    // Comentariile cu cele mai multe like-uri
    const reviewsWithMostLikes = await Review.find()
      .sort({ likes: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName')
      .populate('bookId', 'title')
      .select('description likes bookId userId');

    // Utilizatorii cu cele mai multe review-uri
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
    if(req.user.role !== 'admin' && req.user.role !== 'author') {
        return res.status(403).json({ message: 'Admin or Author role required. Your role is: ' + req.user.role });
      }
    const { title, author, genres, pages, coverImage, description } = req.body;
    const newBook = new Book({
      title,
      author,
      genres,
      pages,
      coverImage,
      description,
    });
    console.log('Adding Book: ', newBook);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    errorHandler(res, error, 'Error adding book');
  }
});

// Adăugare autor
router.post('/authors', authMiddleware, async (req, res) => {
  try {
    if(req.user.role !== 'admin') {
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
    if(req.user.role !== 'admin') {
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
      // Verifică dacă utilizatorul este admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin role required. Your role is: ' + req.user.role });
      }
  
      const { role } = req.body;
  
      // Verifică dacă rolul este valid
      if (!['admin', 'user', 'author'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
  
      // Găsește utilizatorul după ID
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Dacă rolul nou este "author"
      if (role === 'author') {
        const authorName = `${user.firstName} ${user.lastName}`;
  
        // Caută un autor existent cu același nume (case-insensitive)
        let author = await Author.findOne({ name: new RegExp(`^${authorName}$`, 'i') });
  
        if (!author) {
          // Creează un nou autor dacă nu există
          author = new Author({
            name: authorName,
            picture: user.profilePicture || '', // Folosește profilePicture al utilizatorului sau șir gol
          });
          await author.save();
        }
  
        // Atribuie ID-ul autorului utilizatorului
        user.authorId = author._id;
      } else {
        // Dacă rolul nu este "author", setează authorId la null
        user.authorId = null;
      }
  
      // Actualizează rolul utilizatorului
      user.role = role;
      await user.save();
  
      // Returnează utilizatorul actualizat
      res.json(user);
    } catch (error) {
      errorHandler(res, error, 'Error updating user role');
    }
  });

// Listare cereri pentru a deveni autor
router.get('/author-requests', authMiddleware, async (req, res) => {
  try {
    if(req.user.role !== 'admin') {
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
    if(req.user.role !== 'admin') {
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
    if(req.user.role !== 'admin') {
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

router.put('authors/:id/updateName', authMiddleware, async (req, res) => {
  try {
    console.log('Reached function Authors/:id/Update');
    if(req.user.role !== 'author' || req.user.role !== 'admin')
    {
      return res.status(403).json({ message: 'Admin or Author role required. Your role is: ' + req.user.role });
    }
    const {name } = req.body;

    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Atualizare nume autor
    author.name = name;
    
    await author.save();

  } catch (error) {
    errorHandler(res, error, 'Error updating author name');
  }
});

module.exports = router;