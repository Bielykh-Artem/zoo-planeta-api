const Router = require("koa-router");
const router = new Router({ prefix: "/dashboard" });

const Ctrl = require("../../controllers/dashboard");

router.get("/", Ctrl.fetchDashboardSettings);

module.exports = router.routes();
