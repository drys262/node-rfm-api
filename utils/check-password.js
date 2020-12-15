const bcrypt = require('bcrypt')
const { UserInputError } = require('apollo-server-express')

async function checkPassword (
  password,
  hash,
  errorMessage = 'User not found',
  errorMetadata = {}
) {
  const isMatch = await bcrypt.compare(password, hash)

  if (!isMatch) {
    throw new UserInputError(errorMessage, { ...errorMetadata })
  }
}

module.exports = checkPassword
