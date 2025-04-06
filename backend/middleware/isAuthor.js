const Book = require('../models/Book');

const isAuthor = async (req, res, next) => {
  try {
    if (req.user.role !== 'author') {
      return res.status(403).json({ message: 'Access denied. Author role required.' });
    }

    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Verifică dacă autorul cărții corespunde cu utilizatorul curent
    console.log('Author of the book:', book.author);
    console.log('Current user:', req.user);
    if (book.author !== `${req.user.firstName} ${req.user.lastName}`) {
      return res.status(403).json({ message: 'Access denied. You are not the author of this book.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying author', error: error.message });
  }
};

module.exports = isAuthor;