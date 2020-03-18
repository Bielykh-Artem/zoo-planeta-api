const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({
  city: { type: String, required: true },
  address: { type: String },
  note: { type: String },
  deliveryType: { type: Number },
  deliveryOffice: { type: String },
  paymentType: { type: Number },
  callback: { type: Boolean, required: true, default: false },
  promoCode: { type: String },
  status: { type: Number },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User' },
  isArchived: { type: Boolean, required: true, default: false },
  orderProducts: [{ type: Schema.ObjectId, ref: 'order_product', required: true }],
  employee: { type: Schema.ObjectId, ref: 'Employee' },
  orderNumber: { type: Number, required: true },
})

module.exports = mongoose.model('order', orderSchema)

// Customer: username, phoneNumber, email
