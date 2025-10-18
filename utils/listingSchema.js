const Joi = require('joi');

// Define validation rules for the listing form
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "Title is required."
    }),
    description: Joi.string().required().messages({
      "string.empty": "Description cannot be empty."
    }),
    price: Joi.number().min(0).required().messages({
      "number.base": "Price must be a number.",
      "number.min": "Price cannot be negative."
    }),
    country: Joi.string().required(),
    location: Joi.string().required(),
    image: Joi.string().allow("", null) // optional
  }).required()
});
