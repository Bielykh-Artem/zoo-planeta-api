module.exports = (privateRouter, publicRouter) => {
  privateRouter.use(require('./supplier'))
  privateRouter.use(require('./price'))
  privateRouter.use(require('./brand'))
  publicRouter.use(require('./auth'))
  privateRouter.use(require('./menu'))
  privateRouter.use(require('./uploader'))
  privateRouter.use(require('./banner'))
  privateRouter.use(require('./dashboard'))
  privateRouter.use(require('./characteristics'))
  privateRouter.use(require('./product'))
}