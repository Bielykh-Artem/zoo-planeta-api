const Router = require('koa-router')
const router = new Router({ prefix: '/suppliers' })

const Ctrl = require('../../controllers/supplier')

router.get('/', Ctrl.fetchSuppliers)
router.post('/', Ctrl.addNewSupplier)
router.put('/:supplierId', Ctrl.editSupplierById)
router.put('/', Ctrl.removeSuppliers)
router.delete('/:supplierId', Ctrl.removeSupplierById)
 
module.exports = router.routes()