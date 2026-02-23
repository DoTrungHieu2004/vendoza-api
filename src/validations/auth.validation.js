const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).trim(),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required().min(6).max(100),
  phone: Joi.string()
    .pattern(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be a valid format',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
