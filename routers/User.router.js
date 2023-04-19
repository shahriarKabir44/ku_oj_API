const UserRepository = require('../repositories/User.repository')
const validateJWT = require('../utils/validateJWT')

const UserRouter = require('express').Router()


UserRouter.get('/isAuthorized', (req, res) => {
    validateJWT(req.headers['token'])
        .then((data) => {
            res.send(data)
        })
})

UserRouter.post('/register', (req, res) => {
    UserRepository.register(req.body)
        .then(data => {
            res.send(data)
        })
})

UserRouter.post('/authenticate', (req, res) => {
    UserRepository.authenticate(req.body)
        .then(data => {
            res.send(data)
        })
})

module.exports = UserRouter