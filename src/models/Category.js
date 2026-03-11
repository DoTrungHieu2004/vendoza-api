const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'category', default: null },
  path: {
    type: String,
    required: true,
    index: true, // for fast regex queries
    default: '/',
  },
  level: { type: Number, required: true, default: 0 },
});

// Indexes
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ path: 1 });

module.exports = mongoose.model('category', categorySchema);
