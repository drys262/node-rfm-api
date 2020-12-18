const { AuthenticationError } = require('apollo-server-express')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const { Manager, User } = require('../models')

const models = {
  ADMIN: User,
  MANAGER: Manager
}

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
      const record = await models[role].findByPk(userId)

      if (record !== null) {
        return {
          ...ctx,
          role: role,
          [role === 'ADMIN' ? 'user' : 'manager']: record
        }
      }
    } catch {
    }
  }

  throw new AuthenticationError('Invalid token')
}
