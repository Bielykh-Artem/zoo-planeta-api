const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({
  username: { type: String, required: true, default: '' },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
  isArchived: { type: Boolean, required: true, default: false },
})

module.exports = mongoose.model('Order', orderSchema)