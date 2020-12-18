const { AuthenticationError } = require('apollo-server-express')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const { User } = require('../models')

module.exports = async ({ req }) => {
  const ctx = {
    user: null,
    mail: req.app.get('mail')
  }

  const { authorization = '' } = req.headers

  if (authorization === '') {
    return ctx
  }

  const token = authorization.replace('Bearer ', '')

  if (validator.isJWT(token)) {
    try {
      const { userId } = await jwt.verify(token, process.env.SECRET)
      const user = await User.findByPk(userId)

      if (user !== null) {
        return { ...ctx, user }
      }
    } catch {
    }
  }

  throw new AuthenticationError('Invalid token')
}
