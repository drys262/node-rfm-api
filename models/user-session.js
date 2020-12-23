const Sequelize = require('sequelize')
const validator = require('validator')

class UserSession extends Sequelize.Model {
  static associate (models) {
    UserSession.belongsTo(models.Manager)
    UserSession.belongsTo(models.User)
  }

  static findByUserIdAndRefreshToken (id, refreshToken, role) {
    return UserSession.findOne({
      where: {
        [role === 'ADMIN' ? 'userId' : 'managerId']: id,
        refreshToken
      }
    })
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

  static isToken (token) {
    return validator.isJWT(token)
  }
}

module.exports = UserSession
