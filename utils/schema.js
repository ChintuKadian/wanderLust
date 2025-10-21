const Joi = require("joi");

// Listing Schema
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.object({
    url: Joi.alternatives() 
      .try(
        Joi.string().uri(),             
        Joi.string().valid('')          
      )
      .default(''),                     
    filename: Joi.string().default('listingimage'),
  }).default({
    filename: 'listingimage',
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
  }),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
});
url: Joi.string()
  .pattern(/^https?:\/\/.+/)
  .required()
  .messages({
    "string.pattern.base": "Image URL must start with http:// or https://",
  }),


// Review Schema
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
  }).required()
});
