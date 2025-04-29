const express = require('express');
const mongoose = require('mongoose');
const Publisher = require('../models/Publisher');
const Book = require('../models/Book');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Adăugare editură (doar admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Rol de admin necesar' });
    }
    const { name, foundedYear, description } = req.body.publisherData;
    if (!name || !foundedYear) {
      return res.status(400).json({ message: 'Numele și anul înființării sunt obligatorii' });
    }

    const newPublisher = new Publisher({
      name,
      foundedYear,
      description,
    });

    await newPublisher.save();
    res.status(201).json(newPublisher);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la adăugarea editurii', error: error.message });
  }
});

// Vizualizare toți publisherii
router.get('/', async (req, res) => {
  try {
    const publishers = await Publisher.find().select('name foundedYear description');
    res.json(publishers);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la obținerea publisherilor', error: error.message });
  }
});



// Vizualizare toate cărțile unei edituri
router.get('/:id/books', async (req, res) => {
  try {
    const publisherId = req.params.id;
    if (!mongoose.isValidObjectId(publisherId)) {
      return res.status(400).json({ message: 'ID editură invalid' });
    }

    const books = await Book.find({ edituraId: publisherId })
      .populate('authorId', 'name')
      .select('title coverImage authorId');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la obținerea cărților', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'ID editură invalid' });
      }
  
      const publisher = await Publisher
        .findById(id)
        .select('name foundedYear description');
  
      if (!publisher) {
        return res.status(404).json({ message: 'Editură inexistentă' });
      }
  
      res.json(publisher);
    } catch (error) {
      res.status(500).json({ message: 'Eroare la obținerea editurii', error: error.message });
    }
  });

module.exports = router;