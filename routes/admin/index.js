module.exports = (privateRouter, publicRouter, publicShopRouter) => {
  privateRouter.use(require('../admin/supplier'))
  privateRouter.use(require('../admin/price'))
  privateRouter.use(require('../admin/brand'))
  publicRouter.use(require('../admin/auth'))
  privateRouter.use(require('../admin/menu'))
  privateRouter.use(require('../admin/uploader'))
  privateRouter.use(require('../admin/banner'))
  privateRouter.use(require('../admin/dashboard'))
  privateRouter.use(require('../admin/characteristics'))
  privateRouter.use(require('../admin/product'))
  privateRouter.use(require('../admin/order'))
  privateRouter.use(require('../admin/user'))
}