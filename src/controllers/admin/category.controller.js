const Category = require('../../models/Category');
const Product = require('../../models/Product');
const { createCategorySchema, updateCategorySchema } = require('../../validations/category.validation');
const slugify = require('../../utils/slugify');

// @desc    Create a new category
// @route   POST /api/admin/categories
// @access  Admin
const createCategory = async (req, res, next) => {
  try {
    const { error, value } = createCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Generate slug from name
    let slug = slugify(value.name);

    // Ensure slug uniqueness by appending a counter if needed
    const existing = await Category.findOne({ slug });
    if (existing) {
      // Simple approach: append a number
      let counter = 1;
      let newSlug = `${slug}-${counter}`;
      while (await Category.findOne({ slug: newSlug })) {
        counter++;
        newSlug = `${slug}-${counter}`;
      }
      slug = newSlug;
    }

    // Determine path and level based on parent
    let path = '/';
    let level = 0;
    if (value.parent_id) {
      const parent = await Category.findById(value.parent_id);
      if (!parent) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
      path = parent.path + parent.slug + '/';
      level = parent.level + 1;
    }

    const category = await Category.create({
      name: value.name,
      slug,
      parent_id: value.parent_id || null,
      path,
      level,
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Admin
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('path');
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID
// @route   GET /api/admin/categories/:id
// @access  Admin
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @accces  Admin
const updateCategory = async (req, res, next) => {
  try {
    const { error, value } = updateCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields
    if (value.name) {
      category.name = value.name;
      // Regenerate slug from new name
      let newSlug = slugify(value.name);
      // Check uniqueness (excluding itself)
      const existing = await Category.findOne({ slug: newSlug, _id: { $ne: category._id } });
      if (existing) {
        let counter = 1;
        let uniqueSlug = `${newSlug}-${counter}`;
        while (await Category.findOne({ slug: uniqueSlug, _id: { $ne: category._id } })) {
          counter++;
          uniqueSlug = `${newSlug}-${counter}`;
        }
        newSlug = uniqueSlug;
      }
      category.slug = newSlug;
    }

    // If parent_id is being changed
    if (value.parent_id !== undefined) {
      // Prevent setting parent to itself
      if (value.parent_id && value.parent_id.toString() === category._id.toString()) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }

      category.parent_id = value.parent_id || null;

      // Recalculate path and level
      if (category.parent_id) {
        const parent = await Category.findById(category.parent_id);
        if (!parent) {
          return res.status(400).json({ message: 'Parent category not found' });
        }
        category.path = parent.path + parent.slug + '/';
        category.level = parent.level + 1;
      } else {
        category.path = '/';
        category.level = 0;
      }
    }

    await category.save();
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    next(error);
  }
};

// @decs    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Admin
const deleteCategory = async (req, res, next) => {
  try {
    // Check if any product uses this category
    const productsCount = await Product.countDocuments({ category_id: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category with existing products' });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
