const Product = require('../models/product')
const ObjectId = require('mongodb').ObjectID

const fetchProducts = async ctx => {
  const { skip, limit, search, completed, supplier } =  ctx.query
  const fields = ['name']
  const populate = ['price']

  const productOptions = {
    isArchived: false
  }

  if (completed !== undefined) {
    productOptions.isCompleted = completed
  }

  const priceOptions = {
    isArchived: false
  }

  if (supplier) {
    priceOptions.supplier = supplier
  }

  const aggregateQuery = [
    { $match: {
      $and: [productOptions],
      $or: fields.map(field => ({ [field]: { $regex: search, $options: 'ig' } })) },
    },
    { $lookup: {
      from: 'prices',
      let: { product_price: "$price" },
      pipeline: [
        { $match:
            { $expr:
                { $and:
                  [
                    { $eq: [ "$_id", "$$product_price"] },
                    priceOptions
                  ]
                }
            }
        },
        { $lookup: {
          from: 'suppliers',
          let: { price_supplier: "$supplier" },
          pipeline: [
            { $match:
                { $expr:
                    { $and:
                      [
                        { $eq: [ "$_id", "$$price_supplier"] },
                      ]
                    }
                }
            },
            { $lookup: {
              from: 'users',
              let: { supplier_user: "$createdBy" },
              pipeline: [
                { $match:
                    { $expr:
                        { $and:
                          [
                            { $eq: [ "$_id", "$$supplier_user"] },
                          ]
                        }
                    }
                },
              ],
              as: 'created_by_user' }
            },
          ],
          as: 'supplier_doc' }
        },
      ],
      as: 'price_doc' }
    },
    { $skip: skip * limit },
    { $limit: Number(limit) },
  ]

  try {
    const products = await Product.aggregate(aggregateQuery)

    ctx.body = products
  } catch (err) {
    ctx.throw(err)
  }

}

const updateProduct = async ctx => {
  const product = ctx.request.body
  const { productId } = ctx.params

  try {
    const updatedProduct = await Product.findByIdAndUpdate({ _id: productId }, product, { new: true })
		ctx.body = updatedProduct
  } catch(err) {
    ctx.throw(err)
  }
}

module.exports = {
  fetchProducts,
  updateProduct
}