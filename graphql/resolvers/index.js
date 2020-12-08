const { GraphQLScalarType, Kind } = require('graphql')
const validator = require('validator')

const uuidValue = (value) => {
  return validator.isUUID(value, 4) ? value : null
}

module.exports.resolvers = {
  UUID: new GraphQLScalarType({
    name: 'UUID',
    parseLiteral (ast) {
      return ast.kind === Kind.STRING ? uuidValue(ast.value) : null
    },
    parseValue: uuidValue,
    serialize: uuidValue
  })
}
