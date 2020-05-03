const Callback = require("../models/callback");
const ObjectId = require("mongodb").ObjectID;

const createCallback = async ({ data: { textmask } }, socket) => {
  try {
    const newCallback = new Callback({
      phone: textmask,
    });

    newCallback._id = new ObjectId();

    const savedBrand = await newCallback.save();
    socket.emit("callback", { callback: savedBrand });

    return savedBrand;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  createCallback,
};
