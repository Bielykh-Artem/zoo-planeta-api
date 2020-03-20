const Order = require('../models/order')
const ObjectId = require('mongodb').ObjectID
const Employee = require('../models/employee')
const Product = require('../models/product')
const OrderProduct = require('../models/orderProduct')
const utils = require('../utils')

const fetchOrders = async ctx => {
  const { skip, limit, search, supplier, startDate, endDate, status } = ctx.query
  const fields = ['orderNumber', 'status', 'city']
  const employeeFields = ['employee.userName', 'employee.email', 'employee.phoneNumber']

  const options = {
    isArchived: false,
  }

  if (supplier) {
    options.supplier = new ObjectId(supplier)
  }

  if (status) {
    options.status = Number(status)
  }

  if (startDate && endDate) {
    options.createdAt = { '$gte': new Date(startDate), '$lt': new Date(endDate) }
  }

  const aggregateQuery = [
    {
      $lookup: {
        from: 'employees',
        let: { order_employees: '$employee' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$order_employees'] }, { isArchived: false }],
              },
            },
          },
        ],
        as: 'employee',
      },
    },
    { $unwind: '$employee' },
    {
      $lookup: {
        from: 'order_products',
        localField: 'orderProducts',
        foreignField: '_id',
        as: 'orderProducts',
      },
    },
    {
      $match: {
        $and: [options],
        $or: [...fields, ...employeeFields].map(field => ({ [field]: { $regex: search, $options: 'ig' } })),
      },
    },
    { $skip: skip * limit },
    { $limit: Number(limit) },
  ]

  try {
    const orders = await Order.aggregate(aggregateQuery)

    await Promise.all(
      orders.map(async order => {
        await Promise.all(
          order.orderProducts.map(async orderProduct => {
            const productAggregateQuery = [
              {
                $match: { _id: orderProduct.product },
              },
              {
                $lookup: {
                  from: 'prices',
                  let: { product_price: '$price' },
                  pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ['$_id', '$$product_price'] }, { isArchived: false }] } } },
                  ],
                  as: 'price',
                },
              },
              { $unwind: '$price' },
            ]

            const foundOrderProduct = await Product.aggregate(productAggregateQuery)
            orderProduct.product = foundOrderProduct

            return orderProduct
          })
        )

        return order
      })
    )

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
        const product = await Product.findOne({ price: _id })

        const orderProduct = {
          product: product._id,
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
