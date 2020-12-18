const fs = require('fs')
const path = require('path')
const { gql, makeExecutableSchema } = require('apollo-server-express')
const { merge } = require('lodash')

const context = require('./context')
const directives = require('./directives')

const resolvers = fs.readdirSync(path.join(__dirname, 'resolvers'))
  .filter((file) => {
    return file.indexOf('.') !== 0 && file.slice(-3) === '.js'
  })
  .map((file) => {
    return require(path.join(__dirname, 'resolvers', file)).resolvers
  })

const typeDefs = fs.readdirSync(path.join(__dirname, 'types'))
  .filter((file) => {
    return file.indexOf('.') !== 0 && file.slice(-4) === '.gql'
  })
  .map((file) => {
    return gql(fs.readFileSync(path.join(__dirname, 'types', file), 'utf8'))
  })

module.exports = {
  context: context,
  schema: makeExecutableSchema({
    inheritResolversFromInterfaces: true,
    resolvers: merge(...resolvers),
    schemaDirectives: directives,
    typeDefs: typeDefs
  }),
  uploads: false
}
