module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.createTable('user_sessions', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID
        },
        user_id: {
          allowNull: true,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'users',
            key: 'id'
          },
          type: Sequelize.UUID
        },
        refresh_token: {
          allowNull: false,
          type: Sequelize.STRING
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

      await queryInterface.addIndex('user_sessions',
        ['refresh_token', 'deleted_at'],
        {
          name: 'user_sessions_refresh_token_deleted_at_ukey',
          transaction: transaction,
          unique: true,
          where: {
            deleted_at: {
              [Sequelize.Op.ne]: null
            }
          }
        }
      )

      await queryInterface.addIndex('user_sessions', ['refresh_token'], {
        name: 'user_sessions_refresh_token_ukey',
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
    return queryInterface.dropTable('user_sessions')
  }
}
