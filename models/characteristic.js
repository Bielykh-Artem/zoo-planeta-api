const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const characteristicSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  options: { type: Array },
  assigned: [{ type: Schema.ObjectId }],
  isActive: { type: Boolean, required: true },
  type: { type: Number, required: true, default: 1 },
  isArchived: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model("Characteristic", characteristicSchema);
