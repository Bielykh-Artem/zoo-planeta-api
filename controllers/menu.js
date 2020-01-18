require('dotenv').config()
const Menu = require('../models/menu')
const ObjectId = require('mongodb').ObjectID

const fetchMenuTree = async ctx => {
  try {
    const menuTree = await Menu.find()
    ctx.body = menuTree
  } catch(err) {
    ctx.throw(err)
  }
}

const prepareMenuTreeBeforeSave = async menuTreeData => {
  for (const [idx, item] of menuTreeData.entries()) {
    item.order = idx

    if (!item._id) {
      item._id = new ObjectId()
    }

    if (item.children && item.children.length) {
      item.children = await prepareMenuTreeBeforeSave(item.children)
    }
  }

  return menuTreeData
}

const updateMenuTree = async ctx => {
  const menuTreeData = ctx.request.body
  const { user } = ctx.decoded
  
  const prepareMenuTree = await prepareMenuTreeBeforeSave(menuTreeData)

  try {
    await Menu.bulkWrite(
      prepareMenuTree.map(item => {
        item.createdBy = user._id

        return {
          updateOne: {
            filter: { _id: item._id },
            update: { $set: item },
            upsert: true
          }
        }
      })
    )

    const foundMenuTree = await Menu.find()
    ctx.body = foundMenuTree
  } catch(err) {
    ctx.throw(err)
  }
}

module.exports = {
  fetchMenuTree,
  updateMenuTree
}