const Sequelize = require('sequelize')
const validator = require('validator')

class UserSession extends Sequelize.Model {
  static associate (models) {
    UserSession.belongsTo(models.User)
    UserSession.belongsTo(models.Manager)
  }

  static findByUserIdAndRefreshToken (userId, refreshToken) {
    return this.findOne({ userId, refreshToken })
  }

  static init (sequelize) {
    return super.init({
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      refreshToken: {
        allowNull: false,
        type: Sequelize.STRING
      }
    }, {
      modelName: 'userSession',
      paranoid: true,
      sequelize: sequelize
    })
  }

  static isToken (refreshToken) {
    return validator.isJWT(refreshToken)
  }
}

module.exports = UserSession
