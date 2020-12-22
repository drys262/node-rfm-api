const Sequelize = require('sequelize')
const validator = require('validator')

class UserSession extends Sequelize.Model {
  static associate (models) {
    UserSession.belongsTo(models.Manager)
    UserSession.belongsTo(models.User)
  }

  static findByUserIdAndRefreshToken (userId, refreshToken) {
    return UserSession.findOne({
      where: { userId, refreshToken }
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
      hooks: {
        afterDestroy: (node) => {
          const { userSession: UserSession } = sequelize.models

          return UserSession.destroy({
            individualHooks: true,
            where: {
              managerId: node.id
            }
          })
        }
      },
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
