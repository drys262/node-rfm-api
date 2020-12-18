require('dotenv').config()

const SendGrid = require('@sendgrid/mail')
const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const helmet = require('helmet')

const ApolloServerConfig = require('./graphql')

SendGrid.setApiKey(process.env.SENDGRID_API_KEY)

const server = new ApolloServer(ApolloServerConfig)
const app = express()

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true)
  app.use(helmet())
}

app.set('mail', SendGrid)
app.use(express.static('public'))

server.applyMiddleware({
  app: app,
  path: '/'
})

app.listen(process.env.PORT || 8081)
