const { UserInputError } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const { decodeId } = require('./node')
const { Manager, User } = require('../../models')

const getNode = async (parent, args, ctx) => {
  const { id } = decodeId(args.id)

  const nodes = await ctx.user.getManagers({
    where: { id }
  })

  const node = nodes[0] || null

  if (node === null) {
    throw new UserInputError('Invalid id', {
      invalidArgs: ['id']
    })
  }

  return node
}

module.exports.resolvers = {
  Mutation: {
    createManager: async (parent, args, ctx) => {
      const { email, name, password } = args.input

      if (!User.isPassword(password)) {
        throw new UserInputError('Invalid old password', {
          invalidArgs: ['oldPassword']
        })
      } else if (!User.isEmail(email)) {
        throw new UserInputError('Invalid email', {
          invalidArgs: ['email']
        })
      } else if (name === '') {
        throw new UserInputError('Invalid name', {
          invalidArgs: ['name']
        })
      }

      const passwordHash = await bcrypt.hash(password, 10)

      return Manager.create({
        userId: ctx.user.id,
        email: email,
        name: name,
        password: passwordHash
      })
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

      return manager.destroy()
    },
    updateManager: async (parent, args, ctx) => {
      const manager = await getNode(parent, args, ctx)

      if (manager === null) {
        throw new UserInputError('Manager not found', {
          invalidArgs: ['id']
        })
      }

      return manager.update(args.input)
    }
  }
}
