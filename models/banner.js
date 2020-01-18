const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bannerSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
  imageText: { type: String, required: true },
  linkText: { type: String, required: true },
  linkUrl: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, required: true },
  isArchived: { type: Boolean, required: true, default: false },
})

module.exports = mongoose.model('Banner', bannerSchema)