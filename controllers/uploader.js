require('dotenv').config()
const cloudinary = require('cloudinary').v2

const uploadImageToCloudinary = async ctx => {
  let base64String = ctx.request.body.file

  cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET 
  })

  try {
    const uploadedImage = await cloudinary.uploader.upload(base64String)
    ctx.body = uploadedImage

  } catch (err) {
    ctx.throw(err)
  }
}

module.exports = {
  uploadImageToCloudinary
}