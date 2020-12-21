const { UserInputError, ApolloError } = require('apollo-server-express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { Manager, User, UserSession } = require('../../models')

module.exports.resolvers = {
  Mutation: {
    signIn: async (parent, args, ctx) => {
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

      const [user, manager] = await Promise.all([
        User.findOneByEmail(email),
        Manager.findOneByEmail(email)
      ])

      if (user === null && manager === null) {
        throw new UserInputError('Invalid email or password', {
          invalidArgs: ['email', 'password']
        })
      }

      const passwordsMatch = await bcrypt.compare(password, ctx.user.password)

      if (!passwordsMatch) {
        throw new UserInputError('Invalid email or password', {
          invalidArgs: ['email', 'password']
        })
      }

      const payload = {
        role: user ? 'ADMIN' : 'MANAGER',
        userId: ctx.user.id
      }

      const [accessToken, refreshToken] = await Promise.all([
        jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' }),
        jwt.sign(payload, process.env.SECRET, { expiresIn: '10y' })
      ])

      await UserSession.create({
        [user ? 'userId' : 'managerId']: ctx.user.id,
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

      const [user, manager] = await Promise.all([
        User.findOneByEmail(email),
        Manager.findOneByEmail(email)
      ])

      if (user === null && manager === null) {
        return { success: true }
      }

      const record = user || manager
      const newPassword = User.generatePassword(16)
      const newPasswordHash = await bcrypt.hash(newPassword, 10)

      try {
        await ctx.mail.send({
          from: process.env.SENDGRID_EMAIL,
          to: record.email,
          subject: 'New Password',
          text: `Your new password: ${newPassword}`
        })
      } catch {
        throw new ApolloError('We were unable to send you an email')
      }

      await record.update({ password: newPasswordHash })

      return { success: true }
    },
    refreshToken: async (parent, args) => {
      const { refreshToken } = args.input

      if (!UserSession.isToken(refreshToken)) {
        throw new UserInputError('Invalid refresh token', {
          invalidArgs: ['refreshToken']
        })
      }

      let userId

      try {
        ({ userId } = await jwt.verify(refreshToken, process.env.SECRET))
      } catch {
        throw new UserInputError('Invalid refresh token', {
          invalidArgs: ['refreshToken']
        })
      }

      const userSession = await UserSession.findByUserIdAndRefreshToken(
        userId,
        refreshToken
      )

      if (userSession === null) {
        throw new UserInputError('Invalid refresh token', {
          invalidArgs: ['refreshToken']
        })
      }

      const newAccessToken = await jwt.sign(
        { userId },
        process.env.SECRET,
        { expiresIn: '1h' }
      )

      return { accessToken: newAccessToken }
    },
    changePassword: async (parent, args, ctx) => {
      const { oldPassword, newPassword } = args.input

      if (!User.isPassword(oldPassword)) {
        throw new UserInputError('Invalid old password', {
          invalidArgs: ['oldPassword']
        })
      } else if (!User.isPassword(newPassword)) {
        throw new UserInputError('Invalid new password', {
          invalidArgs: ['newPassword']
        })
      }

      const passwordsMatch = await bcrypt.compare(
        oldPassword,
        ctx.user.password
      )

      if (!passwordsMatch) {
        throw new UserInputError('Invalid old password', {
          invalidArgs: ['oldPassword']
        })
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10)
      await ctx.user.update({ password: newPasswordHash })

      return { success: true }
    }
  }
}
