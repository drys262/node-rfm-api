require('dotenv').config()

const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const helmet = require('helmet')
const SendGrid = require('@sendgrid/mail')

const ApolloServerConfig = require('./graphql')

const server = new ApolloServer(ApolloServerConfig)
const app = express()

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true)
  app.use(helmet())
}

app.use(express.static('public'))
app.configure(() => {
  SendGrid.setApiKey(process.env.SENDGRID_API_KEY)
  app.set('mail', SendGrid)
})

server.applyMiddleware({
  app: app,
  path: '/'
})

app.listen(process.env.PORT || 8081)
