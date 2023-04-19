const jwt = require('jsonwebtoken')

async function validateJWT(token) {

    let user = {
        id: 1,
        name: 'kabir',
        password: 'kabir'
    }
    token = jwt.sign(user, process.env.jwtSecret)
    if (!token) return { user: null, token: null }
    else {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.jwtSecret, (err, user) => {
                if (err) {
                    resolve({
                        user: null,
                        token: null
                    })
                }
                else {
                    resolve({
                        user: user,
                        token: token
                    })
                }
            })
        })

    }
}
module.exports = validateJWT