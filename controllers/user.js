const fetchUser = async ctx => {
  const { userId } = ctx.params

  try {
    const user = await User.findOne({ _id: userId })
    ctx.body = user
  } catch (err) {
    ctx.throw(err)
  }
}

module.exports = {
  fetchUser
}