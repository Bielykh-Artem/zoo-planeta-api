const Router = require("koa-router");
const router = new Router({ prefix: "/auth" });

const Ctrl = require("../../controllers/auth");

router.post("/login", Ctrl.signIn);
router.post("/registration", Ctrl.signUp);
router.post("/activation", Ctrl.accountActivation);
router.post("/forgot-password", Ctrl.forgotPassword);
router.post("/reset-password", Ctrl.resetPassword);
router.get("/:userId", Ctrl.fetchUserForActivation);

module.exports = router.routes();
