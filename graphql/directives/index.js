const GuestDirective = require('./guest')
const UserDirective = require('./user')
const ManagerDirective = require('./manager')
const AuthDirective = require('./manager')

module.exports = {
  guest: GuestDirective,
  user: UserDirective,
  manager: ManagerDirective,
  auth: AuthDirective
}
