const Router = require('koa-router')
const router = new Router({ prefix: '/users' })

const Ctrl = require('../../controllers/user')

router.get('/:userId', Ctrl.fetchUser)
 
module.exports = router.routes()