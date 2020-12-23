const Sequelize = require('sequelize')

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
        type: Sequelize.UUID
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
      modelName: 'manager',
      paranoid: true,
      sequelize: sequelize
    })
  }

  static async isEmailUnique (email) {
    const node = await Manager.findOneByEmail(email)
    return node === null
  }
}

module.exports = Manager
