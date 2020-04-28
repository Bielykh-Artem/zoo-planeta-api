const Router = require("koa-router");
const router = new Router({ prefix: "/brands" });

const Ctrl = require("../../controllers/brand");

router.get("/", Ctrl.fetchBrands);

module.exports = router.routes();
