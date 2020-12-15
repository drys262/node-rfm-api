const Sequelize = require('sequelize')

const User = require('./index').user

class UserSession extends Sequelize.Model {
  static init (sequelize) {
    return super.init({
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      refreshToken: {
        allowNull: false,
        type: Sequelize.UUID
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: User,
          key: 'id'
        }
      }
    }, {
      modelName: 'user_sessions',
      paranoid: true,
      sequelize: sequelize
    })
  }
}

module.exports = UserSession
