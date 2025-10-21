const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const {validateListing } = require("../middleware");
const {isloggedIn}=require("../middleware");  


// INDEX ROUTE
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("index.ejs", { allListings });
}));

// NEW ROUTE
router.get("/new",isloggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE ROUTE
router.post("/",isloggedIn, validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  if (typeof newListing.image === "string") {
      newListing.image = {
          filename: "listingimage",
          url: newListing.image || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
    };
  }
  if (!newListing.image.url) {
  newListing.image.url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e';
  }
  newListing.owner=req.user._id;
  // console.log(req.body.listing.image.url);
  await newListing.save();
  req.flash("success","New Listing created");
  res.redirect(`/listings/${newListing._id}`);
}));

// SHOW ROUTE
router.get("/:id", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("reviews").populate("owner");
  console.log(listing);
  if (!listing){
    req.flash("error","Listing doesn't exist");
    res.redirect("/listings"); 
  }
  res.render("listings/show.ejs", { listing });
}));

// EDIT ROUTE
router.get("/:id/edit",isloggedIn, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing){
    req.flash("error","Listing doesn't exist");
    res.redirect("/listings"); 
  }
  res.render("listings/edit.ejs", { listing });
}));

// UPDATE ROUTE
router.put("/:id",isloggedIn, validateListing, wrapAsync(async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
  req.flash("success","listing Updated");
  res.redirect(`/listings/${req.params.id}`);
}));

// DELETE ROUTE
router.delete("/:id",isloggedIn, wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success","Listing Deleted");
  res.redirect("/listings");
}));

module.exports = router;
