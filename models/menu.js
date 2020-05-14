const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const menuSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    refPath: "onModel",
  },
  onModel: {
    type: String,
    enum: ["MainSeo"],
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, default: "" },
  children: { type: Array, required: true, default: [] },
  assignedCharacteristics: { type: Array, required: true, default: [] },
  order: { type: Number, required: true, default: 0 },
  expanded: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model("Menu", menuSchema);
