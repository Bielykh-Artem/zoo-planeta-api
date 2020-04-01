const Router = require('koa-router')
const router = new Router({ prefix: '/products' })

const Ctrl = require('../../controllers/product')

router.get('/', Ctrl.fetchProductsForShop)
router.get('/:productId', Ctrl.fetchProductForShop)

module.exports = router.routes()
