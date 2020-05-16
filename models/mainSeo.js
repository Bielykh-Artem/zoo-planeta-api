const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mainSeoSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: "User", required: true },
  menuId: { type: Schema.ObjectId, ref: "Menu", required: true },
  text: { type: String, required: true },
  shortText: { type: String, required: true },
});

module.exports = mongoose.model("MainSeo", mainSeoSchema);
