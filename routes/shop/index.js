module.exports = publicRouter => {
  publicRouter.use(require('../shop/dashboard'))
  publicRouter.use(require('../shop/banner'))
  publicRouter.use(require('../shop/menu'))
  publicRouter.use(require('../shop/product'))
  publicRouter.use(require('../shop/order'))
  publicRouter.use(require('../shop/characteristics'))
}
