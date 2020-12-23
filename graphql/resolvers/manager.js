const { UserInputError } = require('apollo-server-express')
const bcrypt = require('bcrypt')
const { upperFirst } = require('lodash')

const { Manager, User } = require('../../models')
const { decodeId, encodeId } = require('./node')

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

const process = async (parent, args, ctx, info, action) => {
  const { email, name, password } = args.input

  if (!User.isEmail(email)) {
    throw new UserInputError('Invalid email', {
      invalidArgs: ['email']
    })
  } else if (!User.isName(name)) {
    throw new UserInputError('Invalid name', {
      invalidArgs: ['name']
    })
  } else if (action === 'create' && !User.isPassword(password)) {
    throw new UserInputError('Invalid password', {
      invalidArgs: ['password']
    })
  }

  const isEmailUnique = await Manager.isEmailUnique(email)

  if (!isEmailUnique) {
    throw new UserInputError('Email should be unique', {
      invalidArgs: ['email']
    })
  }

  let node

  if (action === 'create') {
    node = Manager.build({ userId: ctx.user.id })
  } else {
    node = await getNode(parent, args, ctx, info)
  }

  node.email = email.trim()
  node.name = name.trim()

  if (action === 'create') {
    node.password = await bcrypt.hash(password, 10)
  }

  return node.save()
}

module.exports.resolvers = {
  Manager: {
    userSessions: (parent) => {
      return parent.getUserSessions()
    },
    userId: (parent) => {
      return encodeId(upperFirst(User.options.name.singular), parent.userId)
    }
  },
  Mutation: {
    createManager: (parent, args, ctx, info) => {
      return process(parent, args, ctx, info, 'create')
    },
    deleteManager: async (parent, args, ctx) => {
      const manager = await getNode(parent, args, ctx)
      return manager.destroy()
    },
    updateManager: (parent, args, ctx, info) => {
      return process(parent, args, ctx, info, 'update')
    }
  }
}
