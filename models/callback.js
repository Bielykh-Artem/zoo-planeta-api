const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const callbackSchema = new Schema({
  phone: { type: String, required: true },
  isActive: { type: Boolean, required: true, default: true },
});

module.exports = mongoose.model("Callback", callbackSchema);
