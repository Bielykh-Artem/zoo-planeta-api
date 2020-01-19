const Router = require('koa-router')
const router = new Router({ prefix: '/dashboard' })

const Ctrl = require('../../controllers/dashboard')

router.get('/', Ctrl.fetchDashboardSettings)
router.post('/', Ctrl.addDashboardSettings)
router.put('/', Ctrl.updateDashboardSettings)

module.exports = router.routes()