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
      refresh_token: {
        allowNull: false,
        type: Sequelize.UUID
      },
      user_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: User,
          key: 'id'
        }
      }
    }, {
      modelName: 'UserSession',
      paranoid: true,
      sequelize: sequelize
    })
  }
}

module.exports = UserSession
