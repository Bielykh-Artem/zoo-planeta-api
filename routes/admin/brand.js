const Router = require('koa-router')
const router = new Router({ prefix: '/brands' })

const Ctrl = require('../../controllers/brand')

router.get('/', Ctrl.fetchBrands)
router.post('/', Ctrl.addNewBrand)
router.put('/:brandId', Ctrl.editBrandById)
router.put('/', Ctrl.removeBrands)
router.delete('/:brandId', Ctrl.removeBrandById)
 
module.exports = router.routes()