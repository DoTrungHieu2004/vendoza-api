const ProductVariant = require('../../models/ProductVariant');
const Product = require('../../models/Product');
const { createVariantSchema, updateVariantSchema } = require('../../validations/variant.validation');

// @desc    Create a new variant
// @route   POST /api/admin/variants
// @access  Admin
const createVariant = async (req, res, next) => {
  try {
    const { error, value } = createVariantSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const variant = await ProductVariant.create(value);
    res.status(201).json(variant);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    next(error);
  }
};

// @desc    Get all variants (optionally filtered by product)
// @route   GET /api/admin/variants?product_id=xxx
// @access  Admin
const getVariants = async (req, res, next) => {
  try {
    const filter = req.query.product_id ? { product_id: req.query.product_id } : {};
    const variants = await ProductVariant.find(filter).populate('product_id', 'name');
    res.json(variants);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single variant by ID
// @route   GET /api/admin/variants/:id
// @access  Admin
const getVariantById = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findById(req.params.id).populate('product_id', 'name');
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    res.json(variant);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a variant
// @route   PUT /api/admin/variants/:id
// @access  Admin
const updateVariant = async (req, res, next) => {
  try {
    const { error, value } = updateVariantSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const variant = await ProductVariant.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });

    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    res.json(variant);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    next(error);
  }
};

// @desc    Delete a variant
// @route   DELETE /api/admin/variants/:id
// @access  Admin
const deleteVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findByIdAndDelete(req.params.id);
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    res.json({ message: 'Variant deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createVariant, getVariants, getVariantById, updateVariant, deleteVariant };
