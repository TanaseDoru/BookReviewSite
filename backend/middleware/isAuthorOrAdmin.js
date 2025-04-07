const Book = require('../models/Book');

const isAuthorOrAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Author role required.' });
    }

    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Verifică dacă authorId al cărții corespunde cu authorId al utilizatorului
    if (req.user.role !== 'admin')
    {
      if (book.authorId.toString() !== req.user.authorId.toString()) {
        return res.status(403).json({ message: 'Access denied. You are not the author of this book.' });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying author', error: error.message });
  }
};

module.exports = isAuthorOrAdmin;