const Supplier = require("../models/supplier");
const ObjectId = require("mongodb").ObjectID;

const fetchSuppliers = async ctx => {
  const { skip = 0, limit = 1000000, search = "" } = ctx.query;
  const fields = ["name", "address", "phones", "emails"];

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
    const suppliers = await Supplier.aggregate(aggregateQuery);
    ctx.body = suppliers;
  } catch (err) {
    ctx.throw(err);
  }
};

const addNewSupplier = async ctx => {
  try {
    const supplier = ctx.request.body;
    const { user } = ctx.decoded;

    const newSupplier = new Supplier({
      ...supplier,
      createdBy: user._id,
    });

    newSupplier._id = new ObjectId();

    const savedSupplier = await newSupplier.save();
    ctx.body = savedSupplier;
  } catch (err) {
    ctx.throw(err);
  }
};

const editSupplierById = async ctx => {
  const supplier = ctx.request.body;
  const { supplierId } = ctx.params;

  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate({ _id: supplierId }, supplier, { new: true });
    ctx.body = updatedSupplier;
  } catch (err) {
    ctx.throw(err);
  }
};

const removeSupplierById = async ctx => {
  const { supplierId } = ctx.params;

  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate({ _id: supplierId }, { isArchived: true }, { new: true });
    ctx.body = updatedSupplier;
  } catch (err) {
    ctx.throw(err);
  }
};

const removeSuppliers = async ctx => {
  const supplierIds = ctx.request.body;

  try {
    const archivedSuppliers = await Supplier.bulkWrite(
      supplierIds.map(id => {
        return {
          updateOne: {
            filter: { _id: id },
            update: { $set: { isArchived: true } },
            upsert: true,
          },
        };
      }),
    );
    ctx.body = archivedSuppliers.result;
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports = {
  fetchSuppliers,
  addNewSupplier,
  editSupplierById,
  removeSuppliers,
  removeSupplierById,
};
