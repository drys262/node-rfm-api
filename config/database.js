require('dotenv').config()

const initialConfig = {
  dialect: 'postgres',
  migrationStoragePath: 'sequelize',
  migrationStorageTableName: 'sequelize_migrations',

  define: {
    underscored: true
  }
}

module.exports = {
  development: {
    ...initialConfig,
    database: 'rfm_partner',
    username: 'root',
    password: null,
    host: '127.0.0.1'
  },
  production: {
    ...initialConfig,
    logging: false,
    use_env_variable: 'DB_URL'
  },
  test: {
    ...initialConfig,
    logging: false,
    use_env_variable: 'DB_URL'
  }
}
