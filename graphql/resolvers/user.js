const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendgrid = require('@sendgrid/mail')
const { v4: uuidv4 } = require('uuid')
const { UserInputError, ApolloError } = require('apollo-server-express')
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const checkPassword = require('../../utils/check-password')
const { User, UserSession } = require('../../models')

async function createToken (payload, refresh = false) {
  return jwt.sign(payload,
    process.env.SECRET,
    { algorithm: 'HS256', expiresIn: refresh ? '10y' : '10m' }
  )
}

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

async function getUserByEmail (
  email,
  ignoreError = false,
  errorMessage = 'User not found'
) {
  const user = await User.findOneByEmail(email)

  if (!user && !ignoreError) {
    throw new UserInputError(errorMessage, { email })
  }

  return user
}

function generatePassword (length) {
  const chs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = chs.length - 1; i--;) {
    result += chs.charAt(Math.floor(Math.random() * chs.length))
  }

  return result
}

module.exports.resolvers = {
  Mutation: {
    signIn: async (parent, args, ctx, info) => {
      const { email, password } = args.input
      const user = await getUserByEmail(email)

      await checkPassword(
        password,
        user.password,
        'User not found',
        { email }
      )

      const [accessToken, refreshToken] = await Promise.all([
        createToken({ userId: user.id }),
        createToken({ userId: user.id }, true)
      ])

      await UserSession.create({
        id: uuidv4(),
        refresh_token: refreshToken,
        user_id: user.id
      })

      return {
        accessToken,
        refreshToken
      }
    },
    forgotPassword: async (parent, args, ctx, info) => {
      const { email } = args.input

      const user = await getUserByEmail(
        email,
        true,
        'Email is not found on our system.'
      )

      if (!user) {
        return { success: true }
      }

      const newPassword = generatePassword(16)

      try {
        const message = {
          from: process.env.SENDGRID_EMAIL,
          to: email,
          subject: 'Your new RFM Password',
          text: `Your new password: ${newPassword}`
        }

        await sendgrid.send(message)
      } catch (err) {
        throw new ApolloError(
          'Our mail client crashed please contact system administrator'
        )
      }

      await user.update({ password: await bcrypt.hash(newPassword, 10) })

      return { success: true }
    },
    refreshToken: async (parent, args, ctx, info) => {
      const { refreshToken: refreshTokenInput } = args.input

      const storedRefreshToken = await UserSession.findOne({
        refresh_token: refreshTokenInput,
        user_id: ctx.user.id
      })

      if (!storedRefreshToken) {
        throw new UserInputError('Refresh token not found.')
      }

      const {
        refresh_token: refreshToken,
        user_id: userId
      } = storedRefreshToken

      try {
        await verifyToken(refreshToken)
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          throw new ApolloError('Refresh token expired')
        }

        throw new ApolloError('Refresh token is invalid')
      }

      const newAccessToken = await createToken({ userId })

      return { accessToken: newAccessToken }
    },
    changePassword: async (parent, args, ctx, info) => {
      const { id: userId } = ctx.user

      const { oldPassword, newPassword } = args.input

      const user = await User.findByPk(userId)

      if (!user) {
        throw new UserInputError('User not found', { id: userId })
      }

      await checkPassword(oldPassword, user.password, 'Password mismatch')

      await user.update({ password: await bcrypt.hash(newPassword, 10) })

      return { success: true }
    }
  }
}
