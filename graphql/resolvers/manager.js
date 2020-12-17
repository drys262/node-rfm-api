const bcrypt = require('bcrypt')
const { UserInputError } = require('apollo-server-express')

const { Manager } = require('../../models')

module.exports.resolvers = {
  Mutation: {
    createManager: async (parent, args, ctx, info) => {
      const { name, email, password } = args.input

      console.log('ctx user id here', ctx.user.id)

      const manager = await Manager.create({
        userId: ctx.user.id,
        name: name,
        email: email,
        password: await bcrypt.hash(password, 10)
      })

      return manager.get({ plain: true })
    },
    deleteManager: async (parent, args, ctx, info) => {
      const manager = await Manager.findOne({
        where: {
          id: args.id,
          userId: ctx.user.id
        }
      })

      if (!manager) {
        throw new UserInputError('Manager not found', { id: args.id })
      }

      await manager.destroy()

      return manager.get({ plain: true })
    },
    updateManager: async (parent, args, ctx, info) => {
      const { id, input } = args

      const manager = await Manager.findByPk(id)

      if (!manager) {
        throw new UserInputError('Manager not found', { id: args.id })
      }

      const updatedManager = await manager.update(input)

      return updatedManager.get({ plain: true })
    }
  }
}
