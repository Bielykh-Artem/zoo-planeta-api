const jwt = require('jsonwebtoken')
const { HttpStatus } = require('http-status-codes')

const requireAuth = async (ctx, next) => {
  const { token } = ctx.request

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET)
      ctx.decoded = decoded

      await next()

    } catch (err) {
      ctx.status = 401
      ctx.body = 'Invalid authorization token'
    }

  } else {
    ctx.status = 401
    ctx.body = 'Unauthorized'
  }

}

const handleJoiErrors = details => {
  if (!details.length) {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: "Bad Request",
    };
  }

  return {
    status: HttpStatus.BAD_REQUEST,
    message: details.map(detail => detail.message).join(),
  };
};

const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    ctx.status = e.httpStatus || HttpStatus.INTERNAL_SERVER_ERROR;
    e.status = ctx.status;

    if (e.isJoi) {
      const { status, message } = handleJoiErrors(e.details);
      ctx.status = status;
      e.status = status;
      e.message = message;
    }

    ctx.body = {
      code: ctx.status,
      message: e.message,
    };
    ctx.app.emit("error", e, ctx);
  }
};

module.exports = {
  requireAuth,
  errorHandler
}