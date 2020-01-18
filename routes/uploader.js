const Router = require('koa-router')
const router = new Router({ prefix: '/uploader' })

const Ctrl = require('../controllers/uploader')

router.post('/', Ctrl.uploadImageToCloudinary)
 
module.exports = router.routes()