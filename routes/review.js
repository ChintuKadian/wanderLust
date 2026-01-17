const express = require("express");
const router = express.Router({ mergeParams: true }); 
const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const { validateReview } = require("../middleware");
const {isloggedIn} = require("../middleware");
const {isNotOwner} = require("../middleware");
const { isReviewAuthor } = require("../middleware");
const review = require("../models/review");


//  POST Route - Create a New Review
router.post(
  "/",
  isloggedIn,
  isNotOwner,
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);

    review.author = req.user._id; // ✅ SET AUTHOR
    listing.reviews.push(review);

    await review.save();
    await listing.save();

    req.flash("success", "Review added");
    res.redirect(`/listings/${listing._id}`);
  })
);


// DELETE Route - Remove a Review
router.delete(
  "/:reviewId",
  isloggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted");
    res.redirect(`/listings/${id}`);
  })
);


module.exports = router;
