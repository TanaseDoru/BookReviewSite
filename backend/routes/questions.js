const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const authMiddleware = require('../middleware/auth'); // Assuming authentication middleware exists

// GET /api/questions/:authorId - Fetch all questions for an author
router.get('/:authorId', async (req, res) => {
  try {
    const questions = await Question.find({ authorId: req.params.authorId }).populate('userId', 'username');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
});

// POST /api/questions/ask/:authorId - Ask a question (authenticated users only)
router.post('/ask/:authorId', authMiddleware, async (req, res) => {
  const { questionText } = req.body;
  if (!questionText) return res.status(400).json({ message: 'Question text is required' });

  try {
    const question = new Question({
      authorId: req.params.authorId,
      userId: req.user.userId, // From auth middleware
      questionText,
    });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error asking question', error });
  }
});

// PUT /api/questions/answer/:questionId - Answer a question (authenticated author only)
router.put('/answer/:questionId', authMiddleware, async (req, res) => {
  const { answerText } = req.body;
  if (!answerText) return res.status(400).json({ message: 'Answer text is required' });

  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    if (question.authorId.toString() !== req.user.authorId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    question.answerText = answerText;
    question.answeredAt = Date.now();
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error answering question', error });
  }
});

module.exports = router;