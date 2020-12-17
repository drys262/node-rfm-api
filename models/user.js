const Sequelize = require('sequelize')
const validator = require('validator')

class User extends Sequelize.Model {
  static init (sequelize) {
    return super.init({
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUIDV4
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(60)
      }
    }, {
      modelName: 'user',
      paranoid: true,
      sequelize: sequelize
    })
  }

  static findOneByEmail (email) {
    return this.findOne({
      where: { email }
    })
  }

  static isEmail (email) {
    return validator.isEmail(email, {
      allow_display_name: false,
      allow_ip_domain: false,
      allow_utf8_local_part: false,
      domain_specific_validation: false,
      require_display_name: false,
      require_tld: true
    })
  }

  static associate (models) {
    User.hasMany(models.UserSession)
  }
}

module.exports = User
