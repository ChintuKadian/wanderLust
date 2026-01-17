const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./utils/schema");
const Listing = require("./models/listing");
const Review = require("./models/review");

// Listing validation
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  }
  next();
};

// Review validation
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  }
  next();
};

// Login check
module.exports.isloggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in first");
    return res.redirect("/login");
  }
  next();
};

// Store redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// OWNER AUTHORIZATION
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // 🚫 NEW CHECK: no owner → nobody can edit
  if (!listing.owner) {
    req.flash("error", "This listing cannot be edited");
    return res.redirect(`/listings/${id}`);
  }

  // 🚫 NOT THE OWNER
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this listing");
    return res.redirect(`/listings/${id}`);
  }

  // ✅ OWNER VERIFIED
  next();
};

// ❌ Owner cannot review own listing
module.exports.isNotOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (listing.owner && listing.owner.equals(req.user._id)) {
    req.flash("error", "You cannot review your own listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// REVIEW AUTHOR AUTHORIZATION
module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId, id } = req.params;

  const review = await Review.findById(reviewId);

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not allowed to delete this review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
