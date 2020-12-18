module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user_sessions', 'manager_id', {
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      references: {
        model: 'managers',
        key: 'id'
      },
      type: Sequelize.UUID
    })
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn('user_sessions', 'manager_id')
  }
}
