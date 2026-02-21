const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password_hash: { type: String, required: true },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        // Simple international phone regex – allows +, digits, spaces, dashes, parentheses
        return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(v);
      },
    },
  },
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'address',
    },
  ],
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  avatar_url: String,
  preferences: { type: Object, default: {} },
  last_login_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ last_login_at: 1 }); // for analytics queries

module.exports = mongoose.model('user', userSchema);
