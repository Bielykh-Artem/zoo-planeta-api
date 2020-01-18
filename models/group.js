const mongoose = require('mongoose')

const Schema = mongoose.Schema

const groupSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Product']
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
  mainProduct: { type: Schema.ObjectId, ref: 'Product', required: true },
  products: [{ type: Schema.ObjectId, ref: 'Product', required: true }]
})

module.exports = mongoose.model('Group', groupSchema)