const { upperFirst } = require('lodash')

const { Manager, User } = require('../../models')
const { encodeId } = require('./node')

module.exports.resolvers = {
  UserSession: {
    managerId: (parent) => {
      return encodeId(upperFirst(Manager.options.name.singular), parent.managerId)
    },
    userId: (parent) => {
      return encodeId(upperFirst(User.options.name.singular), parent.userId)
    },
    manager: (parent) => {
      return parent.getManager()
    }
  }
}
