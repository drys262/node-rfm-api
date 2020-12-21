const Sequelize = require('sequelize')
const validator = require('validator')

class Manager extends Sequelize.Model {
  static associate (models) {
    Manager.belongsTo(models.User)
    Manager.hasMany(models.UserSession)
  }

  static findOneByEmail (email) {
    return Manager.findOne({
      where: { email }
    })
  }

  static init (sequelize) {
    return super.init({
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUIDV4
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(60)
      }
    }, {
      modelName: 'manager',
      paranoid: true,
      sequelize: sequelize
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
}

module.exports = Manager
