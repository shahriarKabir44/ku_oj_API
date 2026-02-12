const jwt = require('jsonwebtoken')
const { sendError } = require('./responseHelper')

function jwtValidator(req, res, next) {

    validateJWT(req.headers['token'])
        .then(({ user }) => {
            if (!user) {
                return sendError(res, 'Invalid User!', 401)
            }
            else {
                req.user = user;
                next();
            }
        })

}

async function validateJWT(token) {

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
module.exports = { validateJWT, jwtValidator }