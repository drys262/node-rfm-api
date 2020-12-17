const Sequelize = require('sequelize')

class UserSession extends Sequelize.Model {
  static init (sequelize) {
    return super.init({
      id: {
        allowNull: false,
        primaryKey: true,
        type: sequelize.UUIDV4
      },
      refreshToken: {
        allowNull: false,
        type: sequelize.STRING
      },
      user_id: {
        allowNull: false,
        type: sequelize.UUIDV4
      }
    }, {
      modelName: 'userSession',
      paranoid: true,
      sequelize: sequelize
    })
  }
}

module.exports = UserSession
