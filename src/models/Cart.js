const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    variant_sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price_snapshot: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => parseFloat(v.toString()),
    },
  },
  { _id: false, toJSON: { getters: true } }
);

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      requried: true,
      unique: true, // one cart per user
      index: true,
    },
    items: [cartItemSchema],
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expires: '50d' }, // TTL index
    },
    status: {
      type: String,
      enum: ['active', 'converted_to_order', 'abandoned'],
      default: 'active',
    },
  },
  {
    timstamps: true,
  }
);

// Indexes
cartSchema.index({ user_id: 1 });
cartSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TT:

module.exports = mongoose.model('cart', cartSchema);
