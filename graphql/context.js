const { AuthenticationError } = require('apollo-server-express')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const { Manager, User } = require('../models')

module.exports = async ({ req }) => {
  const ctx = {
    mail: req.app.get('mail'),
    user: null
  }

  const { authorization = '' } = req.headers

  if (authorization === '') {
    return ctx
  }

  const token = authorization.replace('Bearer ', '')

  if (validator.isJWT(token)) {
    try {
      const { userId, role } = await jwt.verify(token, process.env.SECRET)

      const [manager, user] = await Promise.all([
        Manager.findByPk(userId),
        User.findByPk(userId)
      ])

      if (user !== null || manager !== null) {
        return {
          ...ctx,
          role: role,
          user: manager || user
        }
      }
    } catch {
    }
  }

  throw new AuthenticationError('Invalid token')
}
