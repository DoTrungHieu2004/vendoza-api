const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const Category = require('../models/Category');

// @desc    Get all active products with pagination and search
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q = '', sortBy = 'created_at', order = 'desc' } = req.query;

    // Build query
    const query = { is_active: true };

    // Text search if query provided
    if (q.trim()) {
      query.$text = { $search: q };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = {};
    sort[sortBy] = sortOrder;

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('category_id', 'name slug')
      .lean();

    // Get total count for pagination metadata
    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID with its variants
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, is_active: true })
      .populate('category_id', 'name slug')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch variants for this product
    const variants = await ProductVariant.find({ product_id: product._id }).lean();

    res.json({ ...product, variants });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById };
