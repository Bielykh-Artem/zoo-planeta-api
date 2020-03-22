const mongoose = require('mongoose')

const Schema = mongoose.Schema

const employeeSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    refPath: 'onModel',
  },
  onModel: {
    type: String,
    enum: ['order_product', 'order'],
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  email: { type: String },
  phoneNumber: { type: String, required: true },
  isArchived: { type: Boolean, required: true, default: false },
})

module.exports = mongoose.model('Employee', employeeSchema)
