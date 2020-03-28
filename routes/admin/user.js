const Router = require('koa-router')
const router = new Router({ prefix: '/users' })

const Ctrl = require('../../controllers/user')

router.get('/:userId', Ctrl.fetchUser)
router.get('/', Ctrl.fetchUsers)
router.post('/', Ctrl.addUser)
router.put('/:userId', Ctrl.editUser)
router.put('/', Ctrl.removeUsers)
router.delete('/:userId', Ctrl.removeUserById)

module.exports = router.routes()