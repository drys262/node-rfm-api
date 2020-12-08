const bcrypt = require('bcrypt')
const faker = require('faker')

module.exports = {
  up: async (queryInterface) => {
    const users = await Promise.all(
      [...Array(100).keys()].map(async () => {
        const firstName = faker.name.firstName()
        const lastName = faker.name.lastName()

        return {
          id: faker.random.uuid(),
          email: faker.internet.email(firstName, lastName).toLowerCase(),
          name: faker.name.findName(firstName, lastName),
          password: await bcrypt.hash('password', 10),
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    )

    return queryInterface.bulkInsert('users', users)
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('users')
  }
}
