const Order = require('../models/order')
const ObjectId = require('mongodb').ObjectID

const fetchOrders = async ctx => {
  const { skip, limit, search } =  ctx.query
  const fields = ['username']

  const options = {
    isArchived: false
  }

  const aggregateQuery = [
    { $match: {
      $and: [options],
      $or: fields.map(field => ({ [field]: { $regex: search, $options: 'ig' } })) },
    },
    { $skip: skip * limit },
    { $limit: Number(limit) },
  ]

  try {
    const orders = await Order.aggregate(aggregateQuery)
    ctx.body = orders
  } catch (err) {
    ctx.throw(err)
  }
}
const addNewOrder = async ctx => {}
const editOrderById = async ctx => {}

module.exports = {
  fetchOrders,
  addNewOrder,
  editOrderById
}