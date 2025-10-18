const express =require("express");
const app=express();
const mongoose=require("mongoose");
const Listing =require("./models/listing.js");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync = require('./utils/wrapAsync');
const ExpressError=require("./utils/ExpressError.js");
const { validateListing } = require("./middleware");


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
    const listing=await Listing.findById(id);
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

