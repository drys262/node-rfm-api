const Sequelize = require('sequelize')
const validator = require('validator')

class UserSession extends Sequelize.Model {
  static associate (models) {
    UserSession.belongsTo(models.Manager)
    UserSession.belongsTo(models.User)
  }

  static async findByUserIdAndRefreshToken (userId, refreshToken, models) {
    const user = await models.User.findByPk(userId)

    return UserSession.findOne({
      where: {
        [user ? 'userId' : 'managerId']: userId,
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
