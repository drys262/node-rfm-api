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

    await queryInterface.bulkInsert('users', users)

    const managers = users.map(user => {
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

    const records = await queryInterface.sequelize.query(
      "SELECT * FROM users where email = 'admin@example.com'"
    )

    const user = records[0][0]

    managers.push({
      id: faker.random.uuid(),
      user_id: user.id,
      email: 'manager@example.com',
      name: faker.name.findName('manager', 'example'),
      password: passwordHash,
      created_at: new Date(),
      updated_at: new Date()
    })

    return queryInterface.bulkInsert('managers', managers)
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('managers')
  }
}
