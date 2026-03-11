const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: 'text', // text index for search
  },
  description: { type: String, trim: true },
  brand: { type: String, trim: true },
  base_image: {
    type: String, // URL
    default: '',
  },
  avg_rating: { type: Number, min: 0, max: 5, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

// Indexes
productSchema.index({ category_id: 1 });
productSchema.index({ name: 'text' });

module.exports = mongoose.model('product', productSchema);
