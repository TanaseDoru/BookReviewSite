const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionText: { type: String, required: true },
  answerText: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  answeredAt: { type: Date },
});

module.exports = mongoose.model('Question', questionSchema);