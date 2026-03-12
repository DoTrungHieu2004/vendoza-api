const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
      index: true,
    },
    SKU: { type: String, required: true, unique: true, uppercase: true, trim: true },
    price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: function (value) {
        // Convert Decimal128 to number for easier use
        return parseFloat(value.toString());
      },
    },
    stock_quantity: { type: Number, required: true, min: 0, default: 0 },
    low_stock_threshold: { type: Number, min: 0, default: 5 },
    attributes: {
      type: mongoose.Schema.Types.Mixed, // e.g., { size: 'M', color: 'Red' }
      default: {},
    },
  },
  {
    toJSON: { getters: true }, // include getters when converting to JSON
    toObject: { getters: true },
  }
);

// Indexes
productVariantSchema.index({ SKU: 1 }, { unique: true });
productVariantSchema.index({ product_id: 1 });

module.exports = mongoose.model('product_variant', productVariantSchema);
