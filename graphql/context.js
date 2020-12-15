const { ApolloError, AuthenticationError } = require('apollo-server-express')
const models = require('../models')
const verifyToken = require('../utils/verify-token')

module.exports = async ({ req }) => {
  const ctx = {
    app: req.app,
    user: null
  }

  const authorization = req.headers.authorization || ''

  if (!authorization) {
    return { user: null }
  }

  const [type, token] = authorization.split(' ')

  if (type.toLowerCase() !== 'bearer') {
    throw new ApolloError(
      `\`${type}\` authorization type is not supported.`
    )
  }

  let claims

  try {
    claims = await verifyToken(token)
  } catch (err) {
    console.log(err)

    if (err.name === 'TokenExpiredError') {
      throw new ApolloError('Access token expired')
    }

    throw new ApolloError('Access token is invalid')
  }

  const { User } = models

  const user = await User.findByPk(claims.userId)

  if (user !== null) {
    return { ...ctx, user }
  }

  throw new AuthenticationError('Invalid token')
}
