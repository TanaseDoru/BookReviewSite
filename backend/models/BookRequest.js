const e = require('express');
const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestType: {
    type: String,
    enum: ['create', 'update'],
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    // opțional — doar pentru requestType === 'update'
  },
  payload: {
    title:      { type: String, required: true },
    authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    genres:     { type: [String], required: true },
    pages:      { type: Number, required: true },
    description:{ type: String },
    coverImage: { type: String },
    edituraId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'denied'],
    default: 'pending',
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // creează createdAt și updatedAt
});

module.exports = mongoose.model('BookRequest', bookRequestSchema);
