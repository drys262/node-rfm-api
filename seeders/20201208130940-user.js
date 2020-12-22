const bcrypt = require('bcrypt')
const faker = require('faker')

module.exports = {
  up: async (queryInterface) => {
    const passwordHash = await bcrypt.hash('password', 10)
    const users = [...Array(100).keys()].map(() => {
      const firstName = faker.name.firstName()
      const lastName = faker.name.lastName()

      return {
        id: faker.random.uuid(),
        email: faker.internet.email(firstName, lastName).toLowerCase(),
        name: faker.name.findName(firstName, lastName),
        password: passwordHash,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    users.push({
      id: faker.random.uuid(),
      email: 'admin@example.com',
      name: faker.name.findName('admin', 'example'),
      password: passwordHash,
      created_at: new Date(),
      updated_at: new Date()
    })

    return queryInterface.bulkInsert('users', users)
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('users')
  }
}
