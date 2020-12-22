const {
  AuthenticationError,
  SchemaDirectiveVisitor
} = require('apollo-server-express')

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve } = field

    field.resolve = function (root, args, ctx, info) {
      if (ctx.user === null) {
        throw new AuthenticationError('Unauthorized')
      }

      return resolve.call(this, root, args, ctx, info)
    }
  }
}

module.exports = AuthDirective
