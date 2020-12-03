const fs = require('fs')
const path = require('path')
const {
  AuthenticationError,
  SchemaDirectiveVisitor,
  makeExecutableSchema,
  gql
} = require('apollo-server-express')
const { GraphQLScalarType, Kind } = require('graphql')
const validator = require('validator')
const _ = require('lodash')

const uuidValue = (value) => {
  return validator.isUUID(value, 4) ? value : null
}

const initialResolvers = {
  UUID: new GraphQLScalarType({
    name: 'UUID',
    parseLiteral (ast) {
      return ast.kind === Kind.STRING ? uuidValue(ast.value) : null
    },
    parseValue: uuidValue,
    serialize: uuidValue
  })
}

const initialTypeDefs = gql`
  directive @guest on FIELD | FIELD_DEFINITION
  directive @user on FIELD | FIELD_DEFINITION

  type Mutation
  type Query

  scalar DateTime
  scalar UUID
`

const resolvers = [initialResolvers]
const typeDefs = [initialTypeDefs]

const nodes = fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
  })
  .map((file) => {
    return require(path.join(__dirname, file))
  })

for (const node of nodes) {
  if (node.resolvers) {
    resolvers.push(node.resolvers)
  }

  if (node.typeDefs) {
    typeDefs.push(node.typeDefs)
  }
}

class GuestDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve } = field

    field.resolve = function (root, args, ctx, info) {
      if (ctx.user !== null) {
        throw new AuthenticationError('Authenticated')
      }

      return resolve.call(this, root, args, ctx, info)
    }
  }
}

class UserDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve } = field

    field.resolve = function (root, args, ctx, info) {
      if (ctx.user === null) {
        throw new AuthenticationError('Unauthenticated')
      }

      return resolve.call(this, root, args, ctx, info)
    }
  }
}

module.exports = {
  schema: makeExecutableSchema({
    inheritResolversFromInterfaces: true,
    resolvers: _.merge(...resolvers),
    schemaDirectives: {
      guest: GuestDirective,
      user: UserDirective
    },
    typeDefs: typeDefs
  }),
  uploads: false
}
