const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    let token = req.headers['token']

    if (!token) res.send({ data: null })
    else {
        jwt.verify(token, process.env.jwtSecret, (err, user) => {
            if (err) {
                res.send({
                    user: null
                })
            }
            else {
                user.password = null
                req.user = user
                next()
            }
        })
    }
}