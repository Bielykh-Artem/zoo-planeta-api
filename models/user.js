const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    refPath: "onModel",
  },
  onModel: {
    type: String,
    enum: [
      "Supplier",
      "Price",
      "Product",
      "Group",
      "Brand",
      "Menu",
      "Banner",
      "Characteristic",
      "order",
      "Dashboard",
      "order_product",
    ],
  },
  createdAt: { type: Date, default: Date.now },
  email: { type: String, required: true },
  hash: { type: String },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  active: { type: Boolean, default: false, required: true },
  role: { type: Number, default: 4 },
});

module.exports = mongoose.model("User", userSchema);
