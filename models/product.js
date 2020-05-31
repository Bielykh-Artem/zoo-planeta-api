const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    refPath: "onModel",
  },
  onModel: {
    type: String,
    enum: ["Group", "order_product"],
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: "User", required: true },
  price: { type: Schema.ObjectId, ref: "Price", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true, default: "" },
  isCompleted: { type: Boolean, required: true, default: false },
  images: { type: Array },
  assigned: { type: Array },
  selectedChars: { type: Object },
  weight: { type: String, default: "" },
  brand: { type: Schema.ObjectId, ref: "Brand", required: true },
  newPacking: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  group: {
    type: Schema.ObjectId,
    ref: "Group",
    required: () => {
      return typeof this.group === "undefined" || (this.group !== null && typeof this.group !== "string");
    },
  },
  isArchived: false,
});

module.exports = mongoose.model("Product", productSchema);
