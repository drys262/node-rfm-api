const Sequelize = require('sequelize')

class UserSession extends Sequelize.Model {
  static init (sequelize) {
    return super.init({
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUIDV4
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUIDV4
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

  static associate (models) {
    UserSession.belongsTo(models.User)
  }
}

module.exports = UserSession
