const mongoose = require('mongoose')

const Schema = mongoose.Schema

const supplierSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    refPath: 'onModel',
  },
  onModel: {
    type: String,
    enum: ['Price', 'Group', 'Product'],
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  emails: { type: String, required: true },
  phones: { type: String, required: true },
  details: { type: String, required: true },
  isActive: { type: Boolean, required: true },
  isArchived: { type: Boolean, required: true, default: false },
})

module.exports = mongoose.model('Supplier', supplierSchema)
