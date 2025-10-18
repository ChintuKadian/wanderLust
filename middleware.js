const { listingSchema } = require("./utils/listingSchema");
const ExpressError = require("./utils/ExpressError");

// Middleware for validating a listing before saving
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);  // send to error handler
  } else {
    next();  // move to the next middleware or route
  }
};
