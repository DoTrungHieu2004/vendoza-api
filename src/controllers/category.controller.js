const Category = require('../models/Category');

// @desc    Get all categories (flat list or tree structure)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const { tree } = req.query; // if tree=true, return nested structure

    const categories = await Category.find().sort('path').lean();

    if (tree === 'true') {
      // Build tree structure
      const categoryMap = {};
      const roots = [];

      categories.forEach((cat) => {
        cat.children = [];
        categoryMap[cat._id] = cat;
      });

      categories.forEach((cat) => {
        if (cat.parent_id && categoryMap[cat.parent_id]) {
          categoryMap[cat.parent_id].children.push(cat);
        } else {
          roots.push(cat);
        }
      });

      return res.json(roots);
    }

    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:identifier
// @access  Public
const getCategoryByIdOrSlug = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    // Determine if identifier is MonogDB ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

    let query = {};
    if (isObjectId) {
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }

    const category = await Category.findOne(query).lean();
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Fetch subcategories
    const subcategories = await Category.find({ parent_id: category._id }).lean();

    res.json({ ...category, subcategories });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategoryByIdOrSlug };
