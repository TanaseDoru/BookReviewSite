const express = require('express');
const BookRequest = require('../models/BookRequest');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

// POST /api/book-requests
router.post('/', auth, async (req, res) => {
  try {
    const { requestType, bookId, payload } = req.body;
    const reqDoc = new BookRequest({
      userId: req.user.userId,
      requestType,
      bookId: requestType === 'update' ? bookId : undefined,
      payload,
    });
    await reqDoc.save();
    res.status(201).json(reqDoc);
  } catch (err) {
    errorHandler(res, err, 'Error creating book request');
  }
});

// GET /api/book-requests       (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin required' });
    }
    const list = await BookRequest
      .find()
      .populate('userId', 'firstName lastName')
      .sort({ requestDate: -1 });
    res.json(list);
  } catch (err) {
    errorHandler(res, err, 'Error fetching book requests');
  }
});

// GET /api/book-requests/my    (any authenticated author)
router.get('/my', auth, async (req, res) => {
  try {
    const mine = await BookRequest
      .find({ userId: req.user.userId })
      .sort({ requestDate: -1 });
    res.json(mine);
  } catch (err) {
    errorHandler(res, err, 'Error fetching your book requests');
  }
});

// PUT /api/book-requests/:id/approve
router.put('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin required' });
    }
    const br = await BookRequest.findById(req.params.id);
    if (!br) return res.status(404).json({ message: 'Not found' });

    if (br.requestType === 'create') {
      await Book.create(br.payload);
    } else {
      await Book.findByIdAndUpdate(br.bookId, br.payload, { new: true });
    }

    br.status = 'accepted';
    await br.save();
    res.json(br);
  } catch (err) {
    errorHandler(res, err, 'Error approving book request');
  }
});

// PUT /api/book-requests/:id/reject
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin required' });
    }
    const br = await BookRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'denied' },
      { new: true }
    );
    if (!br) return res.status(404).json({ message: 'Not found' });
    res.json(br);
  } catch (err) {
    errorHandler(res, err, 'Error rejecting book request');
  }
});

module.exports = router;
