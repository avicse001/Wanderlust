const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/Review");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware");

const reviewController = require("../controllers/reviews");

// ============================
// POST - Add a Review
// ============================
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// ============================
// DELETE - Remove a Review
// ============================
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;
