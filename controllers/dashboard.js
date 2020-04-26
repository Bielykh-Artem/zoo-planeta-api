require("dotenv").config();
const Dashboard = require("../models/dashboard");
const ObjectId = require("mongodb").ObjectID;

const fetchDashboardSettings = async ctx => {
  try {
    const dashboard = await Dashboard.findOne();
    ctx.body = dashboard;
  } catch (err) {
    ctx.throw(err);
  }
};

const addDashboardSettings = async ctx => {
  try {
    const dashboard = ctx.request.body;
    const { user } = ctx.decoded;

    const newDashboard = new Dashboard({
      ...dashboard,
      createdBy: user._id,
    });

    newDashboard._id = new ObjectId();

    const savedDashboard = await newDashboard.save();
    ctx.body = savedDashboard;
  } catch (err) {
    ctx.throw(err);
  }
};

const updateDashboardSettings = async ctx => {
  const dashboard = ctx.request.body;

  try {
    const updatedDashboard = await Dashboard.findByIdAndUpdate({ _id: dashboard._id }, dashboard, { new: true });
    ctx.body = updatedDashboard;
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports = {
  fetchDashboardSettings,
  addDashboardSettings,
  updateDashboardSettings,
};
