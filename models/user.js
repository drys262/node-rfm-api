const Sequelize = require('sequelize')
const validator = require('validator')

class User extends Sequelize.Model {
  static associate (models) {
    User.hasMany(models.Manager)
    User.hasMany(models.UserSession)
  }

  static findOneByEmail (email) {
    return User.findOne({
      where: { email }
    })
  }

  static generatePassword (length) {
    const chs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = length - 1; i--;) {
      result += chs.charAt(Math.floor(Math.random() * chs.length))
    }

    return result
  }

  static init (sequelize) {
    return super.init({
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
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
      hooks: {
        afterDestroy: (node) => {
          const {
            manager: Manager,
            userSession: UserSession
          } = sequelize.models

          return Promise.all(
            [Manager, UserSession].map((Model) => {
              return Model.destroy({
                individualHooks: true,
                where: {
                  userId: node.id
                }
              })
            })
          )
        }
      },
      modelName: 'user',
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

  static async isEmailUnique (email) {
    const node = await User.findOneByEmail(email)
    return node === null
  }

  static isName (name) {
    return !validator.isEmpty(name)
  }

  static isPassword (password) {
    return validator.isLength(password, { min: 6 })
  }
}

module.exports = User
