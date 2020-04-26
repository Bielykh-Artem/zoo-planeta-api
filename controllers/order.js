const Order = require("../models/order");
const ObjectId = require("mongodb").ObjectID;
const Client = require("../models/client");
const User = require("../models/user");
const Product = require("../models/product");
const OrderProduct = require("../models/orderProduct");
const utils = require("../utils");

const fetchOrders = async ctx => {
  const { skip = 0, limit = 100000, search = "", supplier, startDate, endDate, status } = ctx.query;
  const fields = ["orderNumber", "status", "city"];
  const clientFields = ["client.userName", "client.email", "client.phoneNumber"];

  const options = {
    isArchived: false,
  };

  if (supplier) {
    options.supplier = new ObjectId(supplier);
  }

  if (status) {
    options.status = Number(status);
  }

  if (startDate && endDate) {
    options.createdAt = { $gte: new Date(startDate), $lt: new Date(endDate) };
  }

  const aggregateQuery = [
    {
      $lookup: {
        from: "clients",
        let: { order_clients: "$client" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$order_clients"] }, { isArchived: false }],
              },
            },
          },
        ],
        as: "client",
      },
    },
    { $unwind: "$client" },
    {
      $lookup: {
        from: "order_products",
        localField: "orderProducts",
        foreignField: "_id",
        as: "orderProducts",
      },
    },
    {
      $match: {
        $and: [options],
        $or: [...fields, ...clientFields].map(field => ({ [field]: { $regex: search, $options: "ig" } })),
      },
    },
    { $skip: skip * limit },
    { $limit: Number(limit) },
  ];

  try {
    const orders = await Order.aggregate(aggregateQuery);

    await Promise.all(
      orders.map(async order => {
        if (order.createdBy) {
          order.createdBy = await User.findOne({ _id: order.createdBy });
        }

        await Promise.all(
          order.orderProducts.map(async orderProduct => {
            const productAggregateQuery = [
              {
                $match: { _id: orderProduct.product },
              },
              {
                $lookup: {
                  from: "prices",
                  let: { product_price: "$price" },
                  pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_price"] }, { isArchived: false }] } } },
                    {
                      $lookup: {
                        from: "suppliers",
                        let: { price_supplier: "$supplier" },
                        pipeline: [
                          { $match: { $expr: { $and: [{ $eq: ["$_id", "$$price_supplier"] }] } } },
                          {
                            $lookup: {
                              from: "users",
                              let: { supplier_user: "$createdBy" },
                              pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$supplier_user"] }] } } }],
                              as: "createdBy",
                            },
                          },
                          { $unwind: "$createdBy" },
                        ],
                        as: "supplier",
                      },
                    },
                    { $unwind: "$supplier" },
                  ],
                  as: "price",
                },
              },
              { $unwind: "$price" },
            ];

            const foundOrderProduct = await Product.aggregate(productAggregateQuery);
            orderProduct.product = foundOrderProduct;

            return orderProduct;
          }),
        );

        return order;
      }),
    );

    ctx.body = orders;
  } catch (err) {
    ctx.throw(err);
  }
};

const addNewOrder = async ctx => {
  const orderProducts = [];
  const { body } = ctx.request;

  const { userName, email, phoneNumber, products } = body;
  const client = { userName, email, phoneNumber };

  if (ctx.decoded && ctx.decoded.user) {
    client.createdBy = ctx.decoded.user._id;
  }

  try {
    /**
     * Create New client
     */

    const newClient = new Client({
      ...client,
    });

    newClient._id = new ObjectId();

    const savedClient = await newClient.save();

    /**
     * Save products with count
     */

    await Promise.all(
      products.map(async ({ _id, count }) => {
        const aggregateProductQuery = [
          {
            $match: {
              $and: [{ isArchived: false }],
            },
          },
          {
            $lookup: {
              from: "prices",
              let: { product_price: "$price" },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_price"] }, { isArchived: false, _id }] } } },
              ],
              as: "price",
            },
          },
          { $unwind: "$price" },
          { $limit: 1 },
        ];

        const product = await Product.aggregate(aggregateProductQuery);

        const orderProduct = {
          product: product[0]._id,
          count,
          sellingPrice: product[0].price.retailPrice,
          client: savedClient._id,
        };

        if (ctx.decoded && ctx.decoded.user) {
          orderProduct.createdBy = ctx.decoded.user._id;
        }

        const newOrderProduct = new OrderProduct({
          ...orderProduct,
        });

        orderProduct._id = new ObjectId();

        const savedOrderProduct = await newOrderProduct.save();
        orderProducts.push(savedOrderProduct._id);
      }),
    );

    /**
     * Save order with productOrder IDs
     */

    const newOrder = new Order({
      ...body,
      status: 0,
      orderProducts,
      client: savedClient._id,
      orderNumber: utils.getUID(),
    });

    if (ctx.decoded && ctx.decoded.user) {
      newOrder.createdBy = ctx.decoded.user._id;
    }

    newOrder._id = new ObjectId();

    const savedOrder = await newOrder.save();
    ctx.body = savedOrder;
  } catch (err) {
    ctx.throw(err);
  }
};
const editOrderById = async ctx => {
  const { body } = ctx.request;
  const { orderProducts, _id } = body;
  const updatedOrderProducts = [];

  try {
    /**
     * Move to archive all assigned products in order
     */

    const foundOrder = await Order.findOne({ _id });

    await Promise.all(
      foundOrder.orderProducts.map(async _orderProduct => {
        await OrderProduct.findByIdAndUpdate({ _id: _orderProduct._id }, { isArchived: true });
      }),
    );

    await Promise.all(
      orderProducts.map(async orderProduct => {
        const { count, sellingPrice, client, product, discount } = orderProduct;

        if (client) {
          /**
           * Update exist product in order
           */
          await OrderProduct.findByIdAndUpdate(
            { _id: orderProduct._id },
            { count, sellingPrice, discount: Number(discount), isArchived: false },
          );
          updatedOrderProducts.push(orderProduct._id);
        } else {
          /**
           * Add new product to order
           */
          const orderProduct = {
            product: product[0]._id,
            count,
            sellingPrice,
            discount: Number(discount),
            client: body.client._id,
          };

          if (ctx.decoded && ctx.decoded.user) {
            orderProduct.createdBy = ctx.decoded.user._id;
          }

          const newOrderProduct = new OrderProduct({
            ...orderProduct,
          });

          orderProduct._id = new ObjectId();
          const savedOrderProduct = await newOrderProduct.save();
          updatedOrderProducts.push(savedOrderProduct._id);
        }
      }),
    );

    const updated = { ...body };
    delete updated.client;
    delete updated.createdBy;

    /**
     * Update client info
     */

    const { userName, email, phoneNumber } = updated;

    await Client.findByIdAndUpdate({ _id: body.client._id }, { userName, email, phoneNumber });

    /**
     * Update order info
     */

    const foundUpdatedOrder = await Order.findByIdAndUpdate(
      { _id },
      { ...updated, orderProducts: updatedOrderProducts },
      { new: true },
    );
    ctx.body = foundUpdatedOrder;
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports = {
  fetchOrders,
  addNewOrder,
  editOrderById,
};
