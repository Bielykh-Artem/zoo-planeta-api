const Router = require('koa-router')
const router = new Router({ prefix: '/products' })

const Ctrl = require('../../controllers/product')

router.get('/', Ctrl.fetchProductsForShop)

module.exports = router.routes()