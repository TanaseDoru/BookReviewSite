const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  foundedYear: { type: Number, required: true },
  description: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Publisher', publisherSchema);