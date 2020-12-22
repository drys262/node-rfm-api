const {
  AuthenticationError,
  SchemaDirectiveVisitor
} = require('apollo-server-express')

class GuestDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve } = field

    field.resolve = function (root, args, ctx, info) {
      if (ctx.user !== null) {
        throw new AuthenticationError('Authorized')
      }

      return resolve.call(this, root, args, ctx, info)
    }
  }
}

module.exports = GuestDirective
