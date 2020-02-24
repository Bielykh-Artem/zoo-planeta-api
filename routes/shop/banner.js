const Router = require('koa-router')
const router = new Router({ prefix: '/banners' })

const Ctrl = require('../../controllers/banner')

router.get('/', Ctrl.fetchBanners)
 
module.exports = router.routes()