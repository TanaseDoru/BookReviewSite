// backend/routes/reviews.js
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Book = require("../models/Book");
const auth = require("../middleware/auth");

// Helper function to update avgRating
const updateBookAvgRating = async (bookId) => {
  const reviews = await Review.find({ bookId });
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
  await Book.findByIdAndUpdate(bookId, { avgRating });
};

// Get user's review for a specific book
router.get("/user/book/:bookId", auth, async (req, res) => {
  try {
    console.log("GET /reviews/user/book/:bookId called");
    const { bookId } = req.params;
    console.log("Fetching review for user:", req.user.userId); // Use req.user.userId
    const review = await Review.findOne({
      bookId,
      userId: req.user.userId, // Use req.user.userId
    });
    res.json(review || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create or update a review
router.post("/book/:bookId", auth, async (req, res) => {
  console.log("POST /reviews/book/:bookId called");
  try {
    const { bookId } = req.params;
    const { rating, description, isSpoiler, startDate, endDate } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    console.log("Authenticated user ID:", req.user.userId); // Use req.user.userId

    const reviewData = {
      userId: req.user.userId, // Use req.user.userId
      bookId,
      rating,
      description: description || "",
      isSpoiler: isSpoiler || false,
      startDate: startDate || null,
      endDate: endDate || null,
      updatedAt: new Date(),
    };

    const review = await Review.findOneAndUpdate(
      { userId: req.user.userId, bookId }, // Use req.user.userId
      { $set: reviewData },
      { upsert: true, new: true }
    );

    // Update book's avgRating
    await updateBookAvgRating(bookId);

    res.json(review);
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;