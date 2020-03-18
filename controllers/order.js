const Order = require('../models/order')
const ObjectId = require('mongodb').ObjectID
const Employee = require('../models/employee')
const OrderProduct = require('../models/orderProduct')
const utils = require('../utils')

const fetchOrders = async ctx => {
  const { skip, limit, search } = ctx.query
  const fields = ['orderNumber', 'status', 'city'] // employee phoneNumber, employee userName, employee email

  const options = {
    isArchived: false,
  }

  const aggregateQuery = [
    {
      $match: {
        $and: [options],
        $or: fields.map(field => ({ [field]: { $regex: search, $options: 'ig' } })),
      },
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
const addNewOrder = async ctx => {
  const orderProducts = []
  const { body } = ctx.request

  const { userName, email, phoneNumber, products } = body
  const employee = { userName, email, phoneNumber }

  if (ctx.decoded && ctx.decoded.user) {
    employee.createdBy = user._id
  }

  try {
    /**
     * Create New Employee
     */

    const newEmployee = new Employee({
      ...employee,
    })

    newEmployee._id = new ObjectId()

    const savedEmployee = await newEmployee.save()

    /**
     * Save products with count
     */

    await Promise.all(
      products.map(async ({ _id, count }) => {
        const orderProduct = {
          product: _id,
          count,
          employee: savedEmployee._id,
        }

        if (ctx.decoded && ctx.decoded.user) {
          orderProduct.createdBy = user._id
        }

        const newOrderProduct = new OrderProduct({
          ...orderProduct,
        })

        orderProduct._id = new ObjectId()

        const savedOrderProduct = await newOrderProduct.save()
        orderProducts.push(savedOrderProduct._id)
      })
    )

    /**
     * Save order with productOrder IDs
     */

    const newOrder = new Order({
      ...body,
      status: 1,
      orderProducts,
      employee: savedEmployee._id,
      orderNumber: utils.getUID(),
    })

    if (ctx.decoded && ctx.decoded.user) {
      newOrder.createdBy = user._id
    }

    newOrder._id = new ObjectId()

    const savedOrder = await newOrder.save()
    ctx.body = savedOrder
  } catch (err) {
    ctx.throw(err)
  }
}
const editOrderById = async ctx => {}

module.exports = {
  fetchOrders,
  addNewOrder,
  editOrderById,
}
