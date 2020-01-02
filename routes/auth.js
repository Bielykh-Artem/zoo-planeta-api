const Router = require('koa-router')
const router = new Router({ prefix: '/auth' })

const Ctrl = require('../controllers/auth')

router.post('/login', Ctrl.signIn)
 
module.exports = router.routes()