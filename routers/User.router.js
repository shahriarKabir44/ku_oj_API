const validateJWT = require('../utils/validateJWT')

const UserRouter = require('express').Router()


UserRouter.get('/isAuthorized', (req, res) => {
    validateJWT(req.headers['token'])
        .then((data) => {
            res.send(data)
        })
})

module.exports = UserRouter