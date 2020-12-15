const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const { UserInputError, ApolloError } = require('apollo-server-express')
const sendgrid = require('@sendgrid/mail')
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)
const models = require('../../models')
const verifyToken = require('../../utils/verify-token')
const checkPassword = require('../../utils/check-password')

async function createToken (payload, refresh = false) {
  return jwt.sign(payload,
    process.env.SECRET,
    { algorithm: 'HS256', expiresIn: refresh ? '10y' : '10m' }
  )
}

async function getUserByEmail (
  email,
  ignoreError = false,
  errorMessage = 'User not found'
) {
  const { User } = models

  const user = await User.findOneByEmail(email)

  if (!user && !ignoreError) {
    throw new UserInputError(errorMessage, { email })
  }

  return user
}

async function sendEmail (params) {
  const message = {
    from: process.env.SENDGRID_EMAIL,
    ...params
  }

  await sendgrid.send(message)
}

function generatePassword (length) {
  let result = ''
  const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    )
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

      try {
        const [accessToken, refreshToken] = await Promise.all([
          createToken({ userId: user.id }),
          createToken({ userId: user.id }, true)
        ])

        const { UserSession } = models

        await UserSession.create({
          id: uuidv4(),
          refresh_token: refreshToken,
          user_id: user.id
        })

        return {
          accessToken,
          refreshToken
        }
      } catch (err) {
        console.log(err)
        throw new ApolloError(err.message)
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
        await sendEmail({
          to: email,
          subject: 'Your new RFM Password',
          text: `Your new password: ${newPassword}`
        })
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

      const { UserSession } = models

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

      const { User } = models

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
