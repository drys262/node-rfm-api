require('dotenv').config()

const initialConfig = {
  dialect: 'postgres',
  migrationStoragePath: 'sequelize',
  migrationStorageTableName: 'sequelize_migrations',
  seederStorage: 'sequelize',
  seederStorageTableName: 'sequelize_seeders',

  define: {
    underscored: true
  }
}

module.exports = {
  development: {
    ...initialConfig,
    use_env_variable: 'DB_URL'
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
