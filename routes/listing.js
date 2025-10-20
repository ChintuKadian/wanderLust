const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { validateListing } = require("../middleware");
  
// INDEX ROUTE
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("index.ejs", { allListings });
}));

// NEW ROUTE
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE ROUTE
router.post("/", validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success","New Listing created");
  res.redirect(`/listings/${newListing._id}`);
}));

// SHOW ROUTE
router.get("/:id", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("reviews");
  if (!listing){
    req.flash("error","Listing doesn't exist");
    res.redirect("/listings"); 
  }
  res.render("listings/show.ejs", { listing });
}));

// EDIT ROUTE
router.get("/:id/edit", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing){
    req.flash("error","Listing doesn't exist");
    res.redirect("/listings"); 
  }
  res.render("listings/edit.ejs", { listing });
}));

// UPDATE ROUTE
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
  req.flash("success","listing Updated");
  res.redirect(`/listings/${req.params.id}`);
}));

// DELETE ROUTE
router.delete("/:id", wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success","Listing Deleted");
  res.redirect("/listings");
}));

module.exports = router;
