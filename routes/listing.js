const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { validateListing } = require("../middleware");
const { isloggedIn }=require("../middleware");  
const { isOwner } = require("../middleware");
const listingController = require("../controllers/listings");
const multer = require("multer");
const cloudinary = require("../cloudinary");
const upload = multer({ dest: "uploads/" });



// INDEX ROUTE
router.get("/", wrapAsync(listingController.index));
// NEW ROUTE
router.get("/new",isloggedIn, listingController.renderNewForm);

// CREATE ROUTE
router.post(
  "/",
  isloggedIn,
  upload.single("listing[imageFile]"), // file picker
  validateListing,
  wrapAsync(async (req, res) => {
    const listing = new Listing(req.body.listing);

    // CASE 1: User uploaded a file
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      listing.image = {
        url: result.secure_url,
        filename: result.public_id,
      };
    }
    // CASE 2: User provided image URL
    else if (req.body.listing.image && req.body.listing.image.trim() !== "") {
      listing.image = {
        url: req.body.listing.image,
        filename: "image-url",
      };
    }
    // CASE 3: Default image
    else {
      listing.image = {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        filename: "default",
      };
    }

    listing.owner = req.user._id;
    await listing.save();

    req.flash("success", "New Listing created");
    res.redirect(`/listings/${listing._id}`);
  })
);


// SHOW ROUTE
router.get("/:id", wrapAsync(listingController.showListing));

// EDIT ROUTE
router.get("/:id/edit",isloggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// UPDATE ROUTE
router.put("/:id",isloggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// DELETE ROUTE
router.delete("/:id",isloggedIn,isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;
