const {
  AuthenticationError,
  SchemaDirectiveVisitor
} = require('apollo-server-express')

class ManagerDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve } = field

    field.resolve = function (root, args, ctx, info) {
      if (ctx.manager === null) {
        throw new AuthenticationError('Unauthenticated')
      }

      return resolve.call(this, root, args, ctx, info)
    }
  }
}

module.exports = ManagerDirective
