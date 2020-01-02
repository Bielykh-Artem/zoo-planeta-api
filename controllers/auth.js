require('dotenv').config()
const User = require('../models/user')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const signIn = async ctx => {
  const { email, password } = ctx.request.body

  try {
    const foudUser = await User.findOne({ email })

    if (foudUser) {
      if (bcrypt.compareSync(password, foudUser.hash)) {
        const token = jwt.sign({ user: foudUser}, process.env.SECRET)
        ctx.body = { token, user: foudUser }
      } else {
        ctx.throw(403, 'Invalid password')
      }
    } else {
      ctx.status = 500
      ctx.body = 'User with such email does not exist'
    }


  } catch(err) {
    ctx.throw(err)
  }
}

module.exports = {
  signIn,
}