const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Supplier']
  },
  createdAt: { type: Date, default: Date.now },
  email: { type: String, required: true },
  hash: { type: String },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  active: { type: Boolean, default: false, required: true },
  role: { type: Array, default: [0] },
})

module.exports = mongoose.model('User', userSchema)