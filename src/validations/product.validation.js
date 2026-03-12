const Joi = require('joi');

const createProductSchema = Joi.object({
  category_id: Joi.string().required(),
  name: Joi.string().required().max(200).trim(),
  description: Joi.string().required(),
  brand: Joi.string().optional().trim(),
  base_image: Joi.string().uri().optional(),
  is_active: Joi.boolean().optional().default(true),
});

const updateProductSchema = Joi.object({
  category_id: Joi.string(),
  name: Joi.string().max(200).trim(),
  description: Joi.string(),
  brand: Joi.string().trim(),
  base_image: Joi.string().uri(),
  is_active: Joi.boolean(),
}).min(1); // at least one field to update

module.exports = { createProductSchema, updateProductSchema };
