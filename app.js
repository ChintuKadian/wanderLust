const express =require("express");
const app=express();
const mongoose=require("mongoose");
const Listing =require("./models/listing.js");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate=require("ejs-mate");


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

app.get("/listings",async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("./index.ejs",{allListings});
    
});

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});


//create route
app.post("/listings", async (req, res) => {
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
});

//Show Route
app.get("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

//edit Route
app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);

    res.render("listings/edit.ejs",{listing});
});

//update route
app.put("/listings/:id",async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let deleted= await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
});

// app.get("/testListing",async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"Sweet house",
//         description:"feel your own home",
//         price:7888,
//         location:"Goa",
//         country:"India"
//     })

//     await sampleListing.save();
//     console.log("save");
//     res.send("added ");
// });



app.listen(8080,()=>{
    console.log(" sever is listening ");
})

