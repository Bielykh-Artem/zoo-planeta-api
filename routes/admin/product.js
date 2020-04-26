const Router = require("koa-router");
const router = new Router({ prefix: "/products" });

const Ctrl = require("../../controllers/product");

router.get("/", Ctrl.fetchProducts);
router.put("/:productId", Ctrl.updateProduct);

router.get("/:supplierId/group", Ctrl.getGroupedProducts);
router.post("/:supplierId/group", Ctrl.groupProducts);

module.exports = router.routes();
