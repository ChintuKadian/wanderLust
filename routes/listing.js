const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { validateListing } = require("../middleware");
const { isloggedIn }=require("../middleware");  
const { isOwner } = require("../middleware");
const listingController = require("../controllers/listings");
const multer = require("multer");
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
  wrapAsync(listingController.createListing)
);


// SHOW ROUTE
router.get("/:id", wrapAsync(listingController.showListing));

// EDIT ROUTE
router.get("/:id/edit",isloggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// UPDATE ROUTE
router.put(
  "/:id",
  isloggedIn,
  isOwner,
  upload.single("listing[imageFile]"), 
  validateListing,
  wrapAsync(listingController.updateListing)
);

// DELETE ROUTE
router.delete("/:id",isloggedIn,isOwner, wrapAsync(listingController.deleteListing));


router.patch("/:id/geometry", async (req, res) => {
  const { lat, lng } = req.body;

  await Listing.findByIdAndUpdate(req.params.id, {
    geometry: { lat, lng }
  });

  res.json({ success: true });
});

module.exports = router;
