const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().required().min(2).max(100).trim(),
  parent_id: Joi.string().optional().allow(null),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  parent_id: Joi.string().optional().allow(null),
}).min(1); // at least one field to update

module.exports = { createCategorySchema, updateCategorySchema };
