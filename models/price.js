const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const priceSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    refPath: "onModel",
  },
  onModel: {
    type: String,
    enum: ["Product"],
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: "User", required: true },
  supplierCode: { type: String, required: true },
  supplier: { type: Schema.ObjectId, ref: "Supplier", required: true },
  name: { type: String, required: true },
  wholesalePrice: { type: Number, required: true },
  retailPrice: { type: Number, required: true },
  discount: { type: String },
  status: { type: Boolean, required: true },
  isActive: { type: Boolean, required: true },
  isArchived: { type: Boolean, default: false },
  orderCount: { type: Number, default: 0 },
  vendorСode: { type: String },
});

module.exports = mongoose.model("Price", priceSchema);
