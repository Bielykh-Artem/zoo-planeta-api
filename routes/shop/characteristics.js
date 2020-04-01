const Router = require('koa-router')
const router = new Router({ prefix: '/characteristics' })

const Ctrl = require('../../controllers/characteristic')

router.get('/', Ctrl.fetchCharacteristics)

module.exports = router.routes()