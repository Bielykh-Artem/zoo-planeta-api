const Price = require("../models/price");
const Product = require("../models/product");
const ObjectId = require("mongodb").ObjectID;

const fetchPrices = async ctx => {
  const { skip = 0, limit = 10000, search = "", supplier } = ctx.query;
  const fields = ["supplier", "supplierCode", "name"];

  const options = {
    isArchived: false,
  };

  if (supplier) {
    options.supplier = new ObjectId(supplier);
  }

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
    const prices = await Price.aggregate(aggregateQuery);
    ctx.body = prices;
  } catch (err) {
    ctx.throw(err);
  }
};

const bulkWritePrice = async ctx => {
  const { price } = ctx.request.body;
  const { user } = ctx.decoded;

  try {
    const uploadedPrice = await Price.bulkWrite(
      price.map(item => {
        item.id = new ObjectId();
        item.createdBy = user._id;
        item.isArchived = false;

        return {
          updateOne: {
            filter: { supplierCode: item.supplierCode },
            update: { $set: item },
            upsert: true,
          },
        };
      }),
    );

    const ids = uploadedPrice.result.upserted.map(priceItem => priceItem._id);

    const aggregateQuery = [
      { $match: { _id: { $in: ids } } },
      {
        $addFields: {
          price: "$_id",
        },
      },
    ];

    const records = await Price.aggregate(aggregateQuery);

    const products = JSON.parse(JSON.stringify(records)).map(record => {
      delete record._id;
      return record;
    });

    await Product.bulkWrite(
      products.map(item => {
        item.id = new ObjectId();
        item.isArchived = false;

        return {
          updateOne: {
            filter: { price: item.price },
            update: { $set: item },
            upsert: true,
          },
        };
      }),
    );

    ctx.body = records;
  } catch (err) {
    ctx.throw(err);
  }
};

const removePriceItemById = async ctx => {
  const { priceId } = ctx.params;

  try {
    const updatedPriceItem = await Price.findByIdAndUpdate({ _id: priceId }, { isArchived: true }, { new: true });
    ctx.body = updatedPriceItem;
  } catch (err) {
    ctx.throw(err);
  }
};

const updatePriceItemById = async ctx => {
  const { priceId } = ctx.params;
  const priceItem = ctx.request.body;

  try {
    const updatedPriceItem = await Price.findByIdAndUpdate({ _id: priceId }, priceItem, { new: true });
    ctx.body = updatedPriceItem;
  } catch (err) {
    ctx.throw(err);
  }
};

const bulkUpdatePrice = async ctx => {
  const { price } = ctx.request.body;
  const { user } = ctx.decoded;

  try {
    const uploadedPrice = await Price.bulkWrite(
      price.map(item => {
        item.id = new ObjectId();
        item.createdBy = user._id;
        item.isArchived = false;

        return {
          updateOne: {
            filter: { supplierCode: item.supplierCode },
            update: { $set: item },
            upsert: true,
          },
        };
      }),
    );

    const ids = uploadedPrice.result.upserted.map(priceItem => priceItem._id);

    const aggregateQuery = [
      { $match: { _id: { $in: ids } } },
      {
        $addFields: {
          price: "$_id",
        },
      },
    ];

    const records = await Price.aggregate(aggregateQuery);
    ctx.body = records;
  } catch (err) {
    ctx.throw(err);
  }
};

const removePrices = async ctx => {
  const priceIds = ctx.request.body;

  try {
    const archivedPrices = await Price.bulkWrite(
      priceIds.map(id => {
        return {
          updateOne: {
            filter: { _id: id },
            update: { $set: { isArchived: true } },
            upsert: true,
          },
        };
      }),
    );
    ctx.body = archivedPrices.result;
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports = {
  fetchPrices,
  bulkWritePrice,
  removePriceItemById,
  updatePriceItemById,
  bulkUpdatePrice,
  removePrices,
};
