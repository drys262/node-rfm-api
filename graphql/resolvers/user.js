const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { UserInputError, ApolloError } = require('apollo-server-express')
const sendgrid = require('@sendgrid/mail')
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)
const models = require('../../models')

async function checkPassword (
  password,
  hash,
  errorMessage = 'User not found',
  errorMetadata = {}
) {
  const isMatch = await bcrypt.compare(password, hash)

  if (!isMatch) {
    throw new UserInputError(errorMessage, { ...errorMetadata })
  }
}

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

        return {
          accessToken,
          refreshToken
        }
      } catch (err) {
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
    refreshToken: (parent, args, ctx, info) => {
      // TODO: do logic refesh token logic
    },
    changePassword: async (parent, args, ctx, info) => {
      const { userId } = ctx.user

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
