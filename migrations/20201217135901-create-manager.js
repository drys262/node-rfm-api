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

      await queryInterface.addIndex('managers',
        ['user_id', 'email', 'deleted_at'],
        {
          name: 'managers_user_id_email_deleted_at_ukey',
          transaction: transaction,
          unique: true
        }
      )

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
