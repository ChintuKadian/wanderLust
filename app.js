const express =require("express");
const app=express();
const mongoose=require("mongoose");
const Listing =require("./models/listing.js");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync = require('./utils/wrapAsync');
const ExpressError=require("./utils/ExpressError.js");
const { validateListing, validateReview } = require("./middleware");
const Review=require("./models/review.js");

app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

main().then(()=>{
    console.log("connect to db");
}).catch((err)=>{
    console.log(err);
})


async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.get("/",(req,res)=>{
    res.send("...");
})

app.get("/listings",wrapAsync(async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("./index.ejs",{allListings});
    
}));

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
// CREATE route
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
  const { title, description, price, country, location, image } = req.body.listing;

  const newListing = new Listing({
    title,
    description,
    price,
    country,
    location,
    image: {
      filename: "listingimage",
      url: image
    }
  });

  await newListing.save();
  res.redirect("/listings");
}));

// UPDATE route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));




//Show Route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//edit Route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);

    res.render("listings/edit.ejs",{listing});
}));



//delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deleted= await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
})) ;

//Reviews
// POST Route - Create a New Review
app.post("/listings/:id/reviews",validateReview, async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review); 
    listing.reviews.push(newReview); 
    

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong while adding the review!");
  }
});

// DELETE Review Route
app.delete("/listings/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;

    // Remove review reference from the listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Delete the review itself
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
});


app.use((req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});


app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;  // Default to 500 if undefined
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err }); // better: render an error page
});

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});


// Centralized error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});
 

app.listen(8080,()=>{
    console.log(" sever is listening ");
})



