const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    code: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: 'general', trim: true },
    status: { type: Boolean, default: true },
    thumbnails: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);