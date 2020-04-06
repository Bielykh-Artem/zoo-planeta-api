const Brand = require('../models/brand')
const ObjectId = require('mongodb').ObjectID

const fetchBrands = async ctx => {
  const { skip = 0, limit = 1000000, search = '' } = ctx.query
  const fields = ['name']

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
    const brands = await Brand.aggregate(aggregateQuery)
    ctx.body = brands
  } catch (err) {
    ctx.throw(err)
  }
}

const addNewBrand = async ctx => {
  try {
    const brand = ctx.request.body
    const { user } = ctx.decoded

    const newBrand = new Brand({
      ...brand,
      createdBy: user._id,
    })

    newBrand._id = new ObjectId()

    const savedBrand = await newBrand.save()
    ctx.body = savedBrand
  } catch (err) {
    ctx.throw(err)
  }
}

const editBrandById = async ctx => {
  const brand = ctx.request.body
  const { brandId } = ctx.params

  try {
    const updatedBrand = await Brand.findByIdAndUpdate({ _id: brandId }, brand, { new: true })
    ctx.body = updatedBrand
  } catch (err) {
    ctx.throw(err)
  }
}

const removeBrandById = async ctx => {
  const { brandId } = ctx.params

  try {
    const updatedBrand = await Brand.findByIdAndUpdate({ _id: brandId }, { isArchived: true }, { new: true })
    ctx.body = updatedBrand
  } catch (err) {
    ctx.throw(err)
  }
}

const removeBrands = async ctx => {
  const brandIds = ctx.request.body

  try {
    const archivedBrands = await Brand.bulkWrite(
      brandIds.map(id => {
        return {
          updateOne: {
            filter: { _id: id },
            update: { $set: { isArchived: true } },
            upsert: true,
          },
        }
      })
    )
    ctx.body = archivedBrands.result
  } catch (err) {
    ctx.throw(err)
  }
}

module.exports = {
  fetchBrands,
  addNewBrand,
  editBrandById,
  removeBrands,
  removeBrandById,
}
