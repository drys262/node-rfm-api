module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.createTable('managers', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID
        },
        user_id: {
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'users',
            key: 'id'
          },
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
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deleted_at: {
          allowNull: true,
          type: Sequelize.DATE
        }
      })

      await queryInterface.addIndex('managers', ['email', 'deleted_at'], {
        name: 'managers_email_deleted_at_ukey',
        transaction: transaction,
        unique: true,
        where: {
          deleted_at: {
            [Sequelize.Op.ne]: null
          }
        }
      })

      await queryInterface.addIndex('managers', ['email'], {
        name: 'managers_email_ukey',
        transaction: transaction,
        unique: true,
        where: {
          deleted_at: null
        }
      })

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('managers')
  }
}
