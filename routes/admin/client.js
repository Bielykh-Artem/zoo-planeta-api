const Router = require('koa-router')
const router = new Router({ prefix: '/clients' })

const Ctrl = require('../../controllers/client')

router.get('/', Ctrl.fetchClients)
router.post('/', Ctrl.addClient)
router.put('/:clientId', Ctrl.editClient)
router.put('/', Ctrl.removeClients)
router.delete('/:clientId', Ctrl.removeClientById)

module.exports = router.routes()
