const express =require("express");
const app=express();
const mongoose=require("mongoose");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const listing=require("./routes/listing.js");
const review = require("./routes/review.js");
const session=require("express-session");
const flash=require("connect-flash");

app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions = {
  secret: "Management",
  resave:false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  }
};

app.use(session(sessionOptions));
app.use(flash());

main().then(()=>{
    console.log("connect to db");
}).catch((err)=>{
    console.log(err);
})


async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.get("/",(req,res)=>{
    res.send("I am root");
})

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
})

app.use("/listings",listing);
app.use("/listings/:id/reviews",review);


// 404 handler
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