const { ApolloError } = require('apollo-server-express')

async function verifyToken (token) {
  // verify token here
}

module.exports = ({ req }) => {
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

  const user = verifyToken(token)

  return { user }
}
