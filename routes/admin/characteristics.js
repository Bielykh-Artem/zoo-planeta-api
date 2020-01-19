const Router = require('koa-router')
const router = new Router({ prefix: '/characteristics' })

const Ctrl = require('../../controllers/characteristic')

router.get('/', Ctrl.fetchCharacteristics)
router.post('/', Ctrl.addNewCharacteristic)
router.put('/:characteristicId', Ctrl.editCharacteristicById)
router.put('/', Ctrl.removeCharacteristics)
router.delete('/:characteristicId', Ctrl.removeCharacteristicById)
 
module.exports = router.routes()