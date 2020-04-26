const Router = require("koa-router");
const router = new Router({ prefix: "/banners" });

const Ctrl = require("../../controllers/banner");

router.get("/", Ctrl.fetchBanners);
router.post("/", Ctrl.addNewBanner);
router.put("/:bannerId", Ctrl.editBannerById);
router.put("/", Ctrl.removeBanners);
router.delete("/:bannerId", Ctrl.removeBannerById);

module.exports = router.routes();
