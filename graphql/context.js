const { ApolloError } = require('apollo-server-express')
const jwt = require('jsonwebtoken')

async function verifyToken (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET, null, (err, claims) => {
      if (err) {
        reject(err)
        return
      }

      resolve(claims)
    })
  })
}

module.exports = async ({ req }) => {
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

  return { user: claims }
}
