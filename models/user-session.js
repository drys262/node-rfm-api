const jwt = require('jsonwebtoken')
const Sequelize = require('sequelize')
const validator = require('validator')

class UserSession extends Sequelize.Model {
  static associate (models) {
    UserSession.belongsTo(models.User)
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

  static async isRefreshToken (userId, refreshToken) {
    if (!validator.isJWT(refreshToken)) {
      return false
    }

    const userSession = await this.findByUserAndRefreshToken(
      userId,
      refreshToken
    )

    if (userSession === null) {
      return false
    }

    try {
      await jwt.verify(refreshToken, process.env.SECRET)
    } catch (err) {
      return false
    }

    return true
  }

  static findByUserAndRefreshToken (userId, refreshToken) {
    return this.findOne({ userId, refreshToken })
  }
}

module.exports = UserSession
