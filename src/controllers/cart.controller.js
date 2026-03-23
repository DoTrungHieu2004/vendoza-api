const Cart = require('../models/Cart');
const ProductVariant = require('../models/ProductVariant');
const Product = require('../models/Product');
const { addItemSchema, updateItemSchema } = require('../validations/cart.validation');

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user_id: userId, status: 'active' });
  if (!cart) {
    cart = await Cart.create({ user_id: userId, items: [] });
  }
  return cart;
};

// Helper to enrich cart items with product details
const enrichCartItems = async (items) => {
  if (!items.length) return items;

  // Get unique variant SKUs
  const skus = [...new Set(items.map((item) => item.variant_sku))];

  // Fetch variants with product details
  const variants = await ProductVariant.find({ SKU: { $in: skus } })
    .populate('product_id', 'name base_image')
    .lean();

  // Map by SKU for quick lookup
  const variantMap = {};
  variants.forEach((v) => {
    variantMap[v.SKU] = v;
  });

  // Enrich each item
  return items.map((item) => {
    const variant = variantMap[item.variant_sku];
    if (variant) {
      return {
        ...(item.toObject ? item.toObject() : item),
        product_name: variant.product_id.name,
        product_image: variant.product_id.base_image,
        variant_attributes: variant.attributes,
        current_stock: variant.stock_quantity,
        price_snapshot: parseFloat(item.price_snapshot), // ensure number
      };
    } else {
      // Variant no longer exists – keep item but mark as unavailable
      return {
        ...(item.toObject ? item.toObject() : item),
        product_name: '[Unavailable]',
        product_image: '',
        variant_attributes: {},
        current_stock: 0,
        unavailable: true,
      };
    }
  });
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const enrichedItems = await enrichCartItems(cart.items);

    // Calculate totals
    const subtotal = enrichedItems.reduce((sum, item) => {
      return sum + item.price_snapshot * item.quantity;
    }, 0);

    res.json({
      cart_id: cart._id,
      items: enrichedItems,
      subtotal,
      item_count: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      expires_at: cart.expires_at,
      status: cart.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addItem = async (req, res, next) => {
  try {
    const { error, value } = addItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { variant_sku, quantity } = value;

    // Find variant and check stock
    const variant = await ProductVariant.findOne({ SKU: variant_sku }).populate('product_id');
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    // Check if product is active
    if (!variant.product_id.is_active) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Get or create cart
    const cart = await getOrCreateCart(req.user._id);

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex((item) => item.variant_sku === variant_sku);

    if (existingItemIndex > -1) {
      // Update quantity
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (newQty > variant.stock_quantity) {
        return res.status(400).json({ message: `Cannot add more than ${variant.stock_quantity} items` });
      }
      cart.items[existingItemIndex].quantity = newQty;
    } else {
      // Add new items with price snapshot
      cart.items.push({
        product_id: variant.product_id._id,
        variant_sku,
        quantity,
        price_snapshot: variant.price,
      });
    }

    await cart.save();

    // Return updated cart
    const enrichedItems = await enrichCartItems(cart.items);
    const subtotal = enrichedItems.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0);

    res.json({
      message: 'Item added to cart',
      items: enrichedItems,
      subtotal,
      item_count: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity (or remove if quantity <= 0)
// @route   PUT /api/cart/items/:variantSku
// @access  Private
const updateItem = async (req, res, next) => {
  try {
    const { variantSku } = req.params;
    const upperSku = variantSku.toUpperCase();
    const { error, value } = updateItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let { quantity } = value;

    const cart = await Cart.findOne({ user_id: req.user_id, status: 'active' });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.variant_sku === upperSku);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      const variant = await ProductVariant.findOne({ SKU: upperSku });
      if (!variant) {
        return res.status(400).json({ message: 'Variant no longer exists' });
      }
      if (quantity > variant.stock_quantity) {
        return res.status(400).json({ message: `Only ${variant.stock_quantity} items in stock` });
      }
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const enrichedItems = await enrichCartItems(cart.items);
    const subtotal = enrichedItems.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0);

    res.json({
      message: quantity <= 0 ? 'Item removed' : 'Item updated',
      items: enrichedItems,
      subtotal,
      item_count: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:variantSku
// @access  Private
const removeItem = async (req, res, next) => {
  try {
    const { variantSku } = req.params;
    const upperSku = variantSku.toUpperCase();

    const cart = await Cart.findOne({ user_id: req.user._id, status: 'active' });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.variant_sku !== upperSku);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cart.save();

    const enrichedItems = await enrichCartItems(cart.items);
    const subtotal = enrichedItems.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0);

    res.json({
      message: 'Item removed',
      items: enrichedItems,
      subtotal,
      item_count: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id, status: 'active' });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared', items: [], subtotal: 0, item_count: 0 });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
