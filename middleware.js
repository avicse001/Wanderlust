const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const multer = require("multer");
const { storage } = require("./cloudConfig"); // Cloudinary storage

// Auth Middleware
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to access this page.");
    return res.redirect("/login");
  }
  next();
};

const saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) res.locals.redirectUrl = req.session.redirectUrl;
  next();
};

const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not authorized to do that!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

const isReviewAuthor = async (req, res, next) => {
  const { reviewId, id } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${id}`);
  }
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not the author of this review.");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// Joi Validation
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

// Multer using Cloudinary storage
const upload = multer({ storage });

module.exports = {
  isLoggedIn,
  saveRedirectUrl,
  isOwner,
  isReviewAuthor,
  validateListing,
  validateReview,
  upload
};
