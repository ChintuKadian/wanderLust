const Joi = require("joi");

// Listing Schema
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),

    image: Joi.object({
      url: Joi.alternatives().try(
        Joi.string().uri(),
        Joi.string().valid("")
      ).default(""),
      filename: Joi.string().default("listingimage")
    }).default({
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60"
    }),

    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),

    geometry: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional()
    }).optional()

  }).required()
});

// Review Schema
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
  }).required()
});
