// backend/routes/reviews.js
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Book = require("../models/Book");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

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
    console.log("Fetching review for user:", req.user.userId);
    const review = await Review.findOne({
      bookId,
      userId: req.user.userId,
    });
    res.json(review || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/book/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 8, rating } = req.query;

    console.log("Fetching reviews for bookId:", bookId, "page:", page, "limit:", limit, "rating:", rating);

    // Validate bookId
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const query = { bookId };
    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments(query);

    // Calculate rating distribution
    console.log("Calculating rating distribution for bookId:", bookId);
    const ratingDistribution = await Review.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((item) => {
      distribution[item._id] = item.count;
    });

    res.json({
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / parseInt(limit)),
      currentPage: parseInt(page),
      ratingDistribution: distribution,
    });
  } catch (err) {
    console.error("Error in /reviews/book/:bookId:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
});

// Create or update a review
router.get("/book/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 8, rating } = req.query;

    console.log("Fetching reviews for bookId:", bookId, "page:", page, "limit:", limit, "rating:", rating);

    // Validate bookId
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const query = { bookId };
    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments(query);

    // Calculate rating distribution
    console.log("Calculating rating distribution for bookId:", bookId);
    const ratingDistribution = await Review.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((item) => {
      distribution[item._id] = item.count;
    });

    res.json({
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / parseInt(limit)),
      currentPage: parseInt(page),
      ratingDistribution: distribution,
    });
  } catch (err) {
    console.error("Error in /reviews/book/:bookId:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
});

// Like or unlike a review
router.post("/like/:reviewId", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user has already liked the review
    const hasLiked = review.likes.includes(userId);

    if (hasLiked) {
      // Remove the like
      review.likes = review.likes.filter((id) => id.toString() !== userId);
    } else {
      // Add the like
      review.likes.push(userId);
    }

    await review.save();

    res.json({
      likes: review.likes.length,
      hasLiked: !hasLiked,
    });
  } catch (err) {
    console.error("Error liking/unliking review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;