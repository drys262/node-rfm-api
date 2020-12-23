const bcrypt = require('bcrypt')
const faker = require('faker')

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      const userAdminQuery = 'SELECT * ' +
        'FROM users ' +
        "WHERE email = 'admin@example.com' " +
        'LIMIT 1;'

      const users = await queryInterface.sequelize.query(userAdminQuery, {
        transaction: transaction,
        type: queryInterface.sequelize.QueryTypes.SELECT
      })

      const user = users[0]
      const passwordHash = await bcrypt.hash('password', 10)

      const managers = [...Array(100).keys()].map(() => {
        const firstName = faker.name.firstName()
        const lastName = faker.name.lastName()

        return {
          id: faker.random.uuid(),
          user_id: user.id,
          email: faker.internet.email(firstName, lastName).toLowerCase(),
          name: faker.name.findName(firstName, lastName),
          password: passwordHash,
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      managers.push({
        id: faker.random.uuid(),
        user_id: user.id,
        email: 'manager@example.com',
        name: faker.name.findName('Manager', 'Example'),
        password: passwordHash,
        created_at: new Date(),
        updated_at: new Date()
      })

      await queryInterface.bulkInsert('managers', managers)
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('managers')
  }
}
