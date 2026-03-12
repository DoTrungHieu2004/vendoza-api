const Product = require('../../models/Product');
const ProductVariant = require('../../models/ProductVariant');
const Category = require('../../models/Category');
const { createProductSchema, updateProductSchema } = require('../../validations/product.validation');

// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Admin
const createProduct = async (req, res, next) => {
  try {
    const { error, value } = createProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.create(value);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Admin
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category_id', 'name slug');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/admin/products/:id
// @access  Admin
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category_id', 'name slug');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Include variants
    const variants = await ProductVariant.find({ product_id: product._id });
    res.json({ product, variants });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Admin
const updateProduct = async (req, res, next) => {
  try {
    const { error, value } = updateProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (and its variants)
// @route   DELETE /api/admin/products/:id
// @access  Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete all variants associated with this product
    await ProductVariant.deleteMany({ product_id: req.params.id });

    res.json({ message: 'Product and its variants deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
