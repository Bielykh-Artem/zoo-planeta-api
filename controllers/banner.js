const Banner = require('../models/banner')
const ObjectId = require('mongodb').ObjectID

const fetchBanners = async ctx => {
  const { skip, limit = 1000000, search = '' } =  ctx.query
  const fields = ['title']

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
    const banners = await Banner.aggregate(aggregateQuery)
    ctx.body = banners
  } catch (err) {
    ctx.throw(err)
  }

}

const addNewBanner = async ctx => {
  try {
    const banner = ctx.request.body
    const { user } = ctx.decoded

    const newBanner = new Banner({
      ...banner,
      createdBy: user._id
    })

    newBanner._id = new ObjectId()

    const savedBanner = await newBanner.save()
    ctx.body = savedBanner

  } catch(err) {
    ctx.throw(err)
  }
}

const editBannerById = async ctx => {
  const banner = ctx.request.body
  const { bannerId } = ctx.params

  try {
    const updatedBanner = await Banner.findByIdAndUpdate({ _id: bannerId }, banner, {new: true})
		ctx.body = updatedBanner
  } catch(err) {
    ctx.throw(err)
  }
}

const removeBannerById = async ctx => {
  const { bannerId } = ctx.params

  try {
    const updatedBanner = await Banner.findByIdAndUpdate({ _id: bannerId }, { isArchived: true }, {new: true})
		ctx.body = updatedBanner
  } catch(err) {
    ctx.throw(err)
  }
}

const removeBanners = async ctx => {
  const bannerIds = ctx.request.body

  try {
    const archivedBanners = await Banner.bulkWrite(
      bannerIds.map(id => {

        return {
          updateOne: {
            filter: { _id: id },
            update: { $set: { isArchived: true } },
            upsert: true
          }
        }
      })
    )
    ctx.body = archivedBanners.result
  } catch(err) {
    ctx.throw(err)
  }
}

module.exports = {
  fetchBanners,
  addNewBanner,
  editBannerById,
  removeBanners,
  removeBannerById
}