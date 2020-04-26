const Router = require("koa-router");
const router = new Router({ prefix: "/orders" });

const Ctrl = require("../../controllers/order");

router.post("/", Ctrl.addNewOrder);

module.exports = router.routes();
