const jwt = require('jsonwebtoken')

async function verifyToken (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET, null, (err, claims) => {
      if (err) {
        reject(err)
        return
      }

      resolve(claims)
    })
  })
}

module.exports = verifyToken
