const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    purchase_datetime: { type: Date, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    purchaser: { type: String, required: true, trim: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
