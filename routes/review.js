const express = require("express");
const router = express.Router({ mergeParams: true }); 
const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const { validateReview } = require("../middleware");

//  POST Route - Create a New Review
router.post("/", validateReview, async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) throw new ExpressError(404, "Listing not found");

    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","new review is created");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    next(err);
  }
});

// DELETE Route - Remove a Review
router.delete("/:reviewId", async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;

    // Remove reference from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Delete review itself
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review is deleted");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
