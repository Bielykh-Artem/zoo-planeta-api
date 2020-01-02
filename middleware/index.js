const jwt = require('jsonwebtoken')

const requireAuth = async (ctx, next) => {
  const { token } = ctx.request

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET)
      ctx.decoded = decoded

      await next()

    } catch(err) {
      ctx.status = 401
      ctx.body = 'Invalid authorization token'
    }

  } else {
    ctx.status = 401
    ctx.body = 'Unauthorized'
  }

}

module.exports = {
  requireAuth
}