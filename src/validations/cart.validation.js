const Joi = require('joi');

const addItemSchema = Joi.object({
  variant_sku: Joi.string().uppercase().trim(),
  quantity: Joi.number().integer().min(1).required(),
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(), // allow 0 to remove
});

module.exports = { addItemSchema, updateItemSchema };
