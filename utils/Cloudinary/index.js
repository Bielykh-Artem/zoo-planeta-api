require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const uploadImage = async base64String => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });

  return await cloudinary.uploader.upload(base64String);
};

module.exports = {
  uploadImage,
};
