const Router = require('koa-router')
const router = new Router({ prefix: '/prices' })

const Ctrl = require('../../controllers/price')

router.get('/', Ctrl.fetchPrices)
router.post('/', Ctrl.bulkWritePrice)
router.put('/', Ctrl.bulkUpdatePrice)
router.put('/:priceId', Ctrl.updatePriceItemById)
router.patch('/', Ctrl.removePrices)
router.delete('/:priceId', Ctrl.removePriceItemById)

module.exports = router.routes()