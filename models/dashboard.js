const mongoose = require('mongoose')

const Schema = mongoose.Schema

const dashboardSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
  title: { type: String, default: '', required: true },
  subTitle: { type: String, default: '', required: true },
  email: { type: String, default: '', required: true },
  skype: { type: String, default: '', required: true },
  aboutUs: { type: String, default: '', required: true },
  address: { type: String, default: '', required: true },
  scheduled: { type: String, default: '', required: true },
  phones: { type: String, default: '', required: true },
  instagram: { type: String },
  localCity: { type: String, required: true, default: 'Харьков' },
  freeDeliveryCompany: { type: String, required: true, default: '2000' },
  freeDelivery: { type: String, required: true, default: '500' },
  codDelivery: { type: String, required: true, default: '300' },
  shippingAndPayment: { type: String, default: '', required: true },
  discountProgram: { type: String, default: '', required: true },
  publicOfferAgreement: { type: String, default: '', required: true },

})

module.exports = mongoose.model('Dashboard', dashboardSchema)