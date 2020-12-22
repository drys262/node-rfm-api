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
      const { userId } = await jwt.verify(token, process.env.SECRET)

      const [manager, user] = await Promise.all([
        Manager.findByPk(userId),
        User.findByPk(userId)
      ])

      if (user !== null || manager !== null) {
        const role = manager === null ? 'ADMIN' : 'MANAGER'

        return {
          ...ctx,
          role: role,
          user: role === 'MANAGER' ? manager : user
        }
      }
    } catch {
    }
  }

  throw new AuthenticationError('Invalid token')
}
