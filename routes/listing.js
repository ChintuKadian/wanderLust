const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { validateListing } = require("../middleware");
const { isloggedIn }=require("../middleware");  
const { isOwner } = require("../middleware");
const listingController = require("../controllers/listings");


// INDEX ROUTE
router.get("/", wrapAsync(listingController.index));
// NEW ROUTE
router.get("/new",isloggedIn, listingController.renderNewForm);

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
router.get("/:id", wrapAsync(listingController.showListing));

// EDIT ROUTE
router.get("/:id/edit",isloggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// UPDATE ROUTE
router.put("/:id",isloggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// DELETE ROUTE
router.delete("/:id",isloggedIn,isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;
