const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const env = process.env.NODE_ENV || 'development'
const config = require('../config/database')[env]

let sequelize

if (config.use_env_variable) {
  const { use_env_variable: useEnvVariable, ...rest } = config
  sequelize = new Sequelize(process.env[useEnvVariable], rest)
} else {
  const { database, password, username, ...rest } = config
  sequelize = new Sequelize(database, username, password, rest)
}

const models = {}

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))
    models[model.name] = model.init(sequelize)
  })

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models)
  }
})

module.exports = { ...models, sequelize }
