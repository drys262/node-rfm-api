const { UserInputError, ApolloError } = require('apollo-server-express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { User, UserSession } = require('../../models')

function generatePassword (length) {
  const chs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = length - 1; i--;) {
    result += chs.charAt(Math.floor(Math.random() * chs.length))
  }

  return result
}

module.exports.resolvers = {
  Mutation: {
    signIn: async (parent, args) => {
      const { email, password } = args.input

      if (!User.isEmail(email)) {
        throw new UserInputError('Invalid email', {
          invalidArgs: ['email']
        })
      } else if (!User.isPassword(password)) {
        throw new UserInputError('Invalid password', {
          invalidArgs: ['password']
        })
      }

      const user = await User.findOneByEmail(email)

      if (user === null) {
        throw new UserInputError('Invalid email or password', {
          invalidArgs: ['email', 'password']
        })
      }

      const passwordsMatch = await bcrypt.compare(password, user.password)

      if (!passwordsMatch) {
        throw new UserInputError('Invalid email or password', {
          invalidArgs: ['email', 'password']
        })
      }

      const [accessToken, refreshToken] = await Promise.all([
        jwt.sign({ userId: user.id }, process.env.SECRET, { expiresIn: '1h' }),
        jwt.sign({ userId: user.id }, process.env.SECRET, { expiresIn: '10y' })
      ])

      await UserSession.create({
        userId: user.id,
        refreshToken: refreshToken
      })

      return { accessToken, refreshToken }
    },
    forgotPassword: async (parent, args, ctx) => {
      const { email } = args.input

      if (!User.isEmail(email)) {
        throw new UserInputError('Invalid email', {
          invalidArgs: ['email']
        })
      }

      const { mail } = ctx

      const user = await User.findOneByEmail(email)

      if (user === null) {
        throw new UserInputError('Invalid email', {
          invalidArgs: ['email']
        })
      }

      if (user === null) {
        return { success: true }
      }

      const newPassword = generatePassword(16)
      const newPasswordHash = await bcrypt.hash(newPassword, 10)

      try {
        await mail.send({
          from: process.env.SENDGRID_EMAIL,
          to: email,
          subject: 'Your new RFM Password',
          text: `Your new password: ${newPassword}`
        })
      } catch (err) {
        throw new ApolloError('We were unable to send you an email')
      }

      await user.update({ password: newPasswordHash })

      return { success: true }
    },
    refreshToken: async (parent, args, ctx) => {
      const { refreshToken } = args.input

      if (!UserSession.isRefreshToken(ctx.user.id, refreshToken)) {
        throw new UserInputError('Invalid refresh token', {
          invalidArgs: ['refreshToken']
        })
      }

      const newAccessToken = await jwt.sign({ userId: ctx.user.id },
        process.env.SECRET,
        { expiresIn: '1h' }
      )

      return {
        accessToken: newAccessToken
      }
    },
    changePassword: async (parent, args, ctx) => {
      const { oldPassword, newPassword } = args.input

      if (!User.isPassword(oldPassword) || !User.isPassword(newPassword)) {
        throw new UserInputError('Invalid password', {
          invalidArgs: ['oldPassword', 'newPassword']
        })
      }

      const passwordsMatch = await bcrypt.compare(oldPassword, ctx.user.password)

      if (!passwordsMatch) {
        throw new UserInputError('Password mismatch')
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10)

      await ctx.user.update({ password: newPasswordHash })

      return { success: true }
    }
  }
}
