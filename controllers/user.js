const User = require("../models/user");
const ObjectId = require("mongodb").ObjectID;
const bcrypt = require("bcryptjs");

const fetchUser = async ctx => {
  const { userId } = ctx.params;

  try {
    const user = await User.findOne({ _id: userId });
    ctx.body = user;
  } catch (err) {
    ctx.throw(err);
  }
};

const fetchUsers = async ctx => {
  const { skip = 0, limit = 1000000, search = "" } = ctx.query;
  const fields = ["email", "firstName", "lastName"];

  const options = {
    active: true,
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
    const users = await User.aggregate(aggregateQuery);
    ctx.body = users;
  } catch (err) {
    ctx.throw(err);
  }
};
const addUser = async ctx => {
  try {
    const data = ctx.request.body;
    const { user } = ctx.decoded;

    const newUser = new User({
      ...data,
      active: true,
      hash: bcrypt.hashSync(user.email, 10),
      createdBy: user._id,
      role: 4,
    });

    newUser._id = new ObjectId();

    const savedUser = await newUser.save();
    ctx.body = savedUser;
  } catch (err) {
    ctx.throw(err);
  }
};

const editUser = async ctx => {
  const data = ctx.request.body;
  const { userId } = ctx.params;

  try {
    const updatedUser = await User.findByIdAndUpdate({ _id: userId }, data, { new: true });
    ctx.body = updatedUser;
  } catch (err) {
    ctx.throw(err);
  }
};

const removeUsers = async ctx => {
  const userIds = ctx.request.body;

  try {
    const archivedUsers = await User.bulkWrite(
      userIds.map(id => {
        return {
          updateOne: {
            filter: { _id: id },
            update: { $set: { active: false } },
            upsert: true,
          },
        };
      }),
    );
    ctx.body = archivedUsers.result;
  } catch (err) {
    ctx.throw(err);
  }
};

const removeUserById = async ctx => {
  const { userId } = ctx.params;

  try {
    const updatedUser = await User.findByIdAndUpdate({ _id: userId }, { active: false }, { new: true });
    ctx.body = updatedUser;
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports = {
  fetchUser,
  fetchUsers,
  addUser,
  editUser,
  removeUsers,
  removeUserById,
};
