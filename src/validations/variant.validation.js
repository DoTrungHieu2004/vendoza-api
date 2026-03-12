const Joi = require('joi');

const createVariantSchema = Joi.object({
  product_id: Joi.string().required(),
  SKU: Joi.string().required().uppercase().trim().min(3).max(50),
  price: Joi.number().positive().required(),
  stock_quantity: Joi.number().integer().min(0).required(),
  low_stock_threshold: Joi.number().integer().min(0).default(5),
  attributes: Joi.object().optional().default({}),
});

const updateVariantSchema = Joi.object({
  SKU: Joi.string().uppercase().trim().min(3).max(50),
  price: Joi.number().positive(),
  stock_quantity: Joi.number().integer().min(0),
  low_stock_threshold: Joi.number().integer().min(0),
  attributes: Joi.object(),
}).min(1); // handle at least one field

module.exports = { createVariantSchema, updateVariantSchema };
