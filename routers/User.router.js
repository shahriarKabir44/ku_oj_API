const UserRepository = require('../repositories/User.repository')
const { validateJWT } = require('../utils/validateJWT')
const { sendSuccess, sendError } = require('../utils/responseHelper')
const { validate } = require('../utils/validateReqest')
const Joi = require('joi')

const UserRouter = require('express').Router()

const registerSchema = Joi.object({ userName: Joi.string().required(), password: Joi.string().required() })
const authSchema = Joi.object({ userName: Joi.string().required(), password: Joi.string().required() })

UserRouter.get('/isAuthorized', (req, res) => {
    validateJWT(req.headers['token'])
        .then((data) => {
            return sendSuccess(res, data)
        })
})

UserRouter.post('/register', validate(registerSchema), (req, res) => {
    UserRepository.register(req.body)
        .then(data => {
            return sendSuccess(res, data)
        })
        .catch(err => sendError(res, err))
})

UserRouter.post('/authenticate', validate(authSchema), (req, res) => {
    UserRepository.authenticate(req.body)
        .then(data => {
            return sendSuccess(res, data)
        })
        .catch(err => sendError(res, err))
})

UserRouter.get('/findUser/:id', validate(Joi.object({ id: Joi.number().required() }), 'params'), (req, res) => {
    UserRepository.findUser('id', req.params.id)
        .then(user => {
            return sendSuccess(res, user)
        })
        .catch(err => sendError(res, err))
})

UserRouter.get('/getHostedContests/:id', validate(Joi.object({ id: Joi.number().required() }), 'params'), (req, res) => {
    UserRepository.getHostedContests(req.params)
        .then(contests => {
            return sendSuccess(res, contests)
        })
        .catch(err => sendError(res, err))
})

UserRouter.post('/getUsersContestSubmissions', (req, res) => {
    UserRepository.getUsersContestSubmissions(req.body)
        .then(contests => {
            return sendSuccess(res, contests)
        })
        .catch(err => sendError(res, err))
})

module.exports = UserRouter