const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: "User" },
  product: { type: Schema.ObjectId, ref: "Product" },
  count: { type: Number, default: 1, required: true },
  sellingPrice: { type: String, required: true },
  discount: { type: Number, required: true, default: 0 },
  client: { type: Schema.ObjectId, ref: "Client" },
  isArchived: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model("order_product", orderSchema);
