const Router = require('koa-router')
const router = new Router({ prefix: '/products' })

const Ctrl = require('../controllers/product')

router.get('/', Ctrl.fetchProducts)
router.put('/:productId', Ctrl.updateProduct)

module.exports = router.routes()