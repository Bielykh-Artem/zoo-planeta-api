const Client = require("../models/client");
const ObjectId = require("mongodb").ObjectID;

const fetchClients = async ctx => {
  const { skip = 0, limit = 1000000, search = "" } = ctx.query;
  const fields = ["userName", "email", "phoneNumber"];

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
    const clients = await Client.aggregate(aggregateQuery);
    ctx.body = clients;
  } catch (err) {
    ctx.throw(err);
  }
};

const addClient = async ctx => {
  try {
    const data = ctx.request.body;
    const { user } = ctx.decoded;

    const newClient = new Client({
      ...data,
      isArchived: false,
      createdBy: user._id,
    });

    newClient._id = new ObjectId();

    const savedClient = await newClient.save();
    ctx.body = savedClient;
  } catch (err) {
    console.log("sfsdfsd", err);
    ctx.throw(err);
  }
};

const editClient = async ctx => {
  const data = ctx.request.body;
  const { clientId } = ctx.params;

  try {
    const updatedClient = await Client.findByIdAndUpdate({ _id: clientId }, data, { new: true });
    ctx.body = updatedClient;
  } catch (err) {
    ctx.throw(err);
  }
};

const removeClients = async ctx => {
  const clientIds = ctx.request.body;

  try {
    const archivedClients = await Client.bulkWrite(
      clientIds.map(id => {
        return {
          updateOne: {
            filter: { _id: id },
            update: { $set: { isArchived: true } },
            upsert: true,
          },
        };
      }),
    );
    ctx.body = archivedClients.result;
  } catch (err) {
    ctx.throw(err);
  }
};

const removeClientById = async ctx => {
  const { clientId } = ctx.params;

  try {
    const updatedClient = await Client.findByIdAndUpdate({ _id: clientId }, { isArchived: true }, { new: true });
    ctx.body = updatedClient;
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports = {
  fetchClients,
  addClient,
  editClient,
  removeClients,
  removeClientById,
};
