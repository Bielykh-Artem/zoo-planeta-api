require('dotenv').config()
const User = require('../models/user')
const ObjectId = require('mongodb').ObjectID
const moment = require('moment')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const api_key = process.env.MAILGUN_API_KEY
const domain = process.env.MAILGUN_DOMAIN
const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain})

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

const signUp = async ctx => {
  const user = ctx.request.body
  const { origin } = ctx.request.headers

  try {
    const existUser = await User.findOne({ email: user.email })

    if(existUser) {
      ctx.throw(409, 'User with such email already exist')
    } else {
      const newUser = new User(user)
      newUser._id = new ObjectId()
      const savedUser = await newUser.save()

      const emailVerificationToken = jwt.sign({
        exp: moment().add(1, 'hours').valueOf(), // 1 hour
        data: savedUser._id
      }, process.env.EMAIL_VERIFICATION_SECRET)

      const data = {
        from: 'Excited User <me@samples.mailgun.org>',
        to: 'bielykh.artem@gmail.com',
        subject: 'Hello',
        text: `To activate your account, follow the link: ${origin}/activation/${emailVerificationToken}`
      }

      mailgun.messages().send(data, (error, body) => {
        console.log(body)
      })

      ctx.body = savedUser
    }

  } catch (err) {
    ctx.throw(err)
  }

}

const accountActivation = async ctx => {
  const user = ctx.request.body

  user.active = true
  user.hash = bcrypt.hashSync(user.password, 10)

  try {
    const existUser = await User.findByIdAndUpdate({ _id: user._id }, user, {new: true})
    ctx.body = existUser
  } catch (err) {
    ctx.throw(err)
  }
}

const forgotPassword = async ctx => {
  const { email } = ctx.request.body
  const { origin } = ctx.request.headers
  
  try {
    const user = await User.findOne({ email })

    if (!user) {
      ctx.throw(409, 'User with such email doesn\'t exist')
    } else {
      const emailVerificationToken = jwt.sign({
        exp: moment().add(1, 'hours').valueOf(), // 1 hour
        data: user._id
      }, process.env.EMAIL_VERIFICATION_SECRET)

      const data = {
        from: 'Excited User <me@samples.mailgun.org>',
        to: 'bielykh.artem@gmail.com',
        subject: 'Hello',
        text: `To change password, follow the link: ${origin}/reset/${emailVerificationToken}`
      }

      mailgun.messages().send(data, (error, body) => {
        console.log(body)
      })

      ctx.body = user
    }

  } catch (err) {
    ctx.throw(err)
  }
}

const resetPassword = async ctx => {
  const { password, userId } = ctx.request.body
  const hash = bcrypt.hashSync(password, 10)

  try {
    const existUser = await User.findByIdAndUpdate({ _id: userId }, { hash }, {new: true})
    ctx.body = existUser
  } catch (err) {
    ctx.throw(err)
  }
}

const fetchUserForActivation = async ctx => {
  const { userId } = ctx.params

  try {
    const user = await User.findOne({ _id: userId })
    ctx.body = user
  } catch (err) {
    ctx.throw(err)
  }

}

module.exports = {
  signIn,
  signUp,
  accountActivation,
  forgotPassword,
  resetPassword,
  fetchUserForActivation
}