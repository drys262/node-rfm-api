const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendgrid = require('@sendgrid/mail')
const { UserInputError, ApolloError } = require('apollo-server-express')
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const { User, UserSession } = require('../../models')

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

      const user = await User.findOneByEmail(email)

      if (!user) {
        throw new UserInputError('User not found', { email })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        throw new UserInputError('User not found', { email })
      }

      const [accessToken, refreshToken] = await Promise.all([
        jwt.sign({ userId: user.id },
          process.env.SECRET,
          { algorithm: 'HS256', expiresIn: '1h' }
        ),
        jwt.sign({ userId: user.id },
          process.env.SECRET,
          { algorithm: 'HS256', expiresIn: '10y' }
        )
      ])

      await UserSession.create({
        refreshToken: refreshToken,
        userId: user.id
      })

      return {
        accessToken,
        refreshToken
      }
    },
    forgotPassword: async (parent, args, ctx, info) => {
      const { email } = args.input

      const user = await User.findOneByEmail(email)

      if (!user) {
        throw new UserInputError('Email is not found on our system', { email })
      }

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

      console.log('storedRefreshToken', storedRefreshToken)

      const { refreshToken, userId } = storedRefreshToken

      try {
        await verifyToken(refreshToken)
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          throw new ApolloError('Refresh token expired')
        }

        throw new ApolloError('Refresh token is invalid')
      }

      const newAccessToken = await jwt.sign({ userId },
        process.env.SECRET,
        { algorithm: 'HS256', expiresIn: '1h' }
      )

      return { accessToken: newAccessToken }
    },
    changePassword: async (parent, args, ctx, info) => {
      const { id: userId } = ctx.user

      const { oldPassword, newPassword } = args.input

      const user = await User.findByPk(userId)

      if (!user) {
        throw new UserInputError('User not found', { id: userId })
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password)

      if (!isMatch) {
        throw new UserInputError('Password mismatch')
      }

      await user.update({ password: await bcrypt.hash(newPassword, 10) })

      return { success: true }
    }
  }
}
