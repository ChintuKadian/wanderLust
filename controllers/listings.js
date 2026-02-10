const Listing = require("../models/listing");
const geocodeLocation = require("../utils/geocode");
const cloudinary = require("../cloudinary");



module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("index.ejs", { allListings });
  
};
module.exports.createListing = async (req, res) => {
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
    // 🔹 GEO-CODING
    const coords = await geocodeLocation(
      listing.location,
      listing.country
  );

  if (coords) {
    listing.geometry = coords; // { lat, lng }
  }
    listing.owner = req.user._id;
    await listing.save();

    req.flash("success", "New Listing created");
    res.redirect(`/listings/${listing._id}`);
  }

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  console.log(listing);

  if (!listing) {
    req.flash("error", "Listing doesn't exist");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};


module.exports.renderEditForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing){
    req.flash("error","Listing doesn't exist");
    res.redirect("/listings"); 
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  // 🔹 update text fields
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;

  // 🔹 IMAGE UPDATE (file > URL > keep old)
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path);
    listing.image = {
      url: result.secure_url,
      filename: result.public_id,
    };
  } else if (req.body.listing.image?.url) {
    listing.image.url = req.body.listing.image.url;
  }
  // else → keep existing image

  // 🔹 GEO-CODING (THIS IS THE KEY PART)
  const coords = await geocodeLocation(
    listing.location,
    listing.country
  );

  if (coords) {
    listing.geometry = coords;
  }

  await listing.save();

  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${listing._id}`);
};


module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success","Listing Deleted");
  res.redirect("/listings");
};

