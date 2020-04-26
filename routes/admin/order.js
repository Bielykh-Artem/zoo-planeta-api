const Router = require("koa-router");
const router = new Router({ prefix: "/orders" });

const Ctrl = require("../../controllers/order");

router.get("/", Ctrl.fetchOrders);
router.post("/", Ctrl.addNewOrder);
router.put("/:orderId", Ctrl.editOrderById);

module.exports = router.routes();
