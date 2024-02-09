const UserRepository = require('../repositories/User.repository')
const { validateJWT } = require('../utils/validateJWT')

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

UserRouter.get('/findUser/:id', (req, res) => {
    UserRepository.findUser('id', req.params.id)
        .then(user => {
            res.send(user)
        })
})

UserRouter.get('/getHostedContests/:id', (req, res) => {
    UserRepository.getHostedContests(req.params)
        .then(contests => {
            res.send(contests)
        })
})

UserRouter.post('/getUsersContestSubmissions', (req, res) => {
    UserRepository.getUsersContestSubmissions(req.body)
        .then(contests => {
            res.send(contests)
        })
})

module.exports = UserRouter