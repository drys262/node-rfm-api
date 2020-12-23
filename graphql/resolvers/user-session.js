const { upperFirst } = require('lodash')

const { Manager, User } = require('../../models')
const { encodeId } = require('./node')

module.exports.resolvers = {
  UserSession: {
    manager: (parent) => {
      return parent.getManager()
    },
    managerId: (parent) => {
      if (!parent.managerId) {
        return null
      }

      return encodeId(
        upperFirst(Manager.options.name.singular), parent.managerId
      )
    },
    // user: (parent) => {
    //   return parent.getUser()
    // },
    userId: (parent) => {
      if (!parent.userId) {
        return null
      }

      return encodeId(upperFirst(User.options.name.singular), parent.userId)
    }
  }
}
