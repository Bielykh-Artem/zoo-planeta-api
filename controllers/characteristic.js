const Characteristic = require("../models/characteristic");
const ObjectId = require("mongodb").ObjectID;

const fetchCharacteristics = async ctx => {
  const { skip = 0, limit = 100000, search = "" } = ctx.query;
  const fields = ["name"];

  const options = {
    isArchived: false,
  };

  const aggregateQuery = [
    {
      $match: {
        $and: [options],
        $or: fields.map(field => ({ [field]: { $regex: search, $options: "ig" } })),
      },
    },
    { $skip: skip * limit },
    { $limit: Number(limit) },
  ];

  try {
    const characteristics = await Characteristic.aggregate(aggregateQuery);
    ctx.body = characteristics;
  } catch (err) {
    ctx.throw(err);
  }
};

const prepareCharacteristicBeforeSave = async options => {
  for (const [idx, item] of options.entries()) {
    item.order = idx;

    if (!item._id) {
      item._id = new ObjectId();
    }
  }

  return options;
};

const addNewCharacteristic = async ctx => {
  try {
    const characteristic = ctx.request.body;
    const { user } = ctx.decoded;

    const options = await prepareCharacteristicBeforeSave([...characteristic.options]);
    characteristic.options = options;

    const newCharacteristic = new Characteristic({
      ...characteristic,
      isArchived: false,
      createdBy: user._id,
    });

    newCharacteristic._id = new ObjectId();

    const savedCharacteristic = await newCharacteristic.save();
    ctx.body = savedCharacteristic;
  } catch (err) {
    ctx.throw(err);
  }
};
const editCharacteristicById = async ctx => {
  const characteristic = ctx.request.body;
  const { characteristicId } = ctx.params;

  try {
    const updatedCharacteristic = await Characteristic.findByIdAndUpdate({ _id: characteristicId }, characteristic, {
      new: true,
    });
    ctx.body = updatedCharacteristic;
  } catch (err) {
    ctx.throw(err);
  }
};

const removeCharacteristics = async ctx => {
  const characteristicIds = ctx.request.body;

  try {
    const archivedCharacteristics = await Characteristic.bulkWrite(
      characteristicIds.map(id => {
        return {
          updateOne: {
            filter: { _id: id },
            update: { $set: { isArchived: true } },
            upsert: true,
          },
        };
      }),
    );
    ctx.body = archivedCharacteristics.result;
  } catch (err) {
    ctx.throw(err);
  }
};

const removeCharacteristicById = async ctx => {
  const { characteristicId } = ctx.params;

  try {
    const updatedCharacteristic = await Characteristic.findByIdAndUpdate(
      { _id: characteristicId },
      { isArchived: true },
      { new: true },
    );
    ctx.body = updatedCharacteristic;
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports = {
  fetchCharacteristics,
  addNewCharacteristic,
  editCharacteristicById,
  removeCharacteristics,
  removeCharacteristicById,
};
