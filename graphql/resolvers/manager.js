const { UserInputError } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const { Manager } = require('../../models')

module.exports.resolvers = {
  Mutation: {
    createManager: async (parent, args, ctx) => {
      const { email, name, password } = args.input

      const manager = await Manager.create({
        userId: ctx.user.id,
        email: email,
        name: name,
        password: await bcrypt.hash(password, 10)
      })

      return manager
    },
    deleteManager: async (parent, args, ctx) => {
      const manager = await Manager.findOne({
        where: {
          id: args.id,
          userId: ctx.user.id
        }
      })

      if (manager === null) {
        throw new UserInputError('Manager not found', {
          invalidArgs: ['id']
        })
      }

      await manager.destroy()

      return manager
    },
    updateManager: async (parent, args) => {
      const manager = await Manager.findByPk(args.id)

      if (manager === null) {
        throw new UserInputError('Manager not found', {
          invalidArgs: ['id']
        })
      }

      const updatedManager = await manager.update(args.input)

      return updatedManager
    }
  }
}
