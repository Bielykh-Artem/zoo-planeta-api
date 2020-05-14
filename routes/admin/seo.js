const Router = require("koa-router");
const router = new Router({ prefix: "/seo" });

const Ctrl = require("../../controllers/seo");

router.post("/", Ctrl.saveMainShopSeo);
router.get("/", Ctrl.fetchMainShopSeo);

module.exports = router.routes();
