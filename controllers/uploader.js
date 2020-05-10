require("dotenv").config();

const { uploadImage } = require("../utils/Cloudinary");

const uploadImageToCloudinary = async ctx => {
  let base64String = ctx.request.body.file;

  try {
    const uploadedImage = await uploadImage(base64String);
    ctx.body = uploadedImage.url;
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports = {
  uploadImageToCloudinary,
};
