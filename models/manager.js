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
        defaultValue: Sequelize.UUID,
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
      modelName: 'manager',
      paranoid: true,
      sequelize: sequelize
    })
  }
}

module.exports = Manager
