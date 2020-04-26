const Router = require("koa-router");
const router = new Router({ prefix: "/menu" });

const Ctrl = require("../../controllers/menu");

router.get("/", Ctrl.fetchMenuTree);

module.exports = router.routes();
