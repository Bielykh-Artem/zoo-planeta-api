const mongoose = require('mongoose')

const Schema = mongoose.Schema

const brandSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, required: true },
  isArchived: { type: Boolean, required: true, default: false },
})

module.exports = mongoose.model('Brand', brandSchema)