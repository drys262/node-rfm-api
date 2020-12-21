const AuthDirective = require('./auth')
const GuestDirective = require('./guest')
const ManagerDirective = require('./manager')
const UserDirective = require('./user')

module.exports = {
  auth: AuthDirective,
  guest: GuestDirective,
  manager: ManagerDirective,
  user: UserDirective
}
