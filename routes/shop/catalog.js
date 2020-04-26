const Router = require("koa-router");
const router = new Router({ prefix: "/catalog" });

const Ctrl = require("../../controllers/catalog");

router.post("/product", Ctrl.fetchProducts);
router.post("/filters", Ctrl.fetchFilteredProducts);

module.exports = router.routes();
