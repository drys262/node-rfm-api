const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { UserInputError, ApolloError } = require('apollo-server-express')
const models = require('../../models')

async function checkPassword (password, hash, email) {
  const isMatch = await bcrypt.compare(password, hash)

  if (!isMatch) {
    throw new UserInputError('User not found', { email })
  }
}

async function createToken (payload, refresh = false) {
  return jwt.sign(payload,
    process.env.SECRET,
    { algorithm: 'HS256', expiresIn: refresh ? '10y' : '10m' }
  )
}

module.exports.resolvers = {
  Mutation: {
    signIn: async (parent, args, ctx, info) => {
      const { email, password } = args.input

      const { User } = models

      const user = await User.findOneByEmail(email)

      if (!user) {
        throw new UserInputError('User not found', { email })
      }

      await checkPassword(password, user.password, email)

      try {
        const [accessToken, refreshToken] = await Promise.all([
          createToken({ userId: user.id }),
          createToken({ userId: user.id }, true)
        ])

        return {
          accessToken,
          refreshToken
        }
      } catch (err) {
        throw new ApolloError(err.message)
      }
    },
    forgotPassword: (parent, args, ctx, info) => {
      // TODO: do logic sign in
    },
    refreshToken: (parent, args, ctx, info) => {
      // TODO: do logic refesh token logic
    }
  }
}
