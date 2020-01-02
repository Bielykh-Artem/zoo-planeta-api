module.exports = (privateRouter, publicRouter) => {
  privateRouter.use(require('./supplier'))
  publicRouter.use(require('./auth'))
}