const ContestRepository = require('../repositories/Contest.repository')

const ContestRouter = require('express').Router()

ContestRouter.post('/createContest', (req, res) => {

})

ContestRouter.post('/createProblem', (req, res) => {
    ContestRepository.createProblem(req.body)
        .then(problemId => {
            res.send({ problemId })
        })
})

ContestRouter.post('/setProblemFilesURL', (req, res) => {
    console.log(req.body)
    ContestRepository.setProblemFilesURL(req.body)
        .then(() => {
            res.send({ success: 1 })
        })
})

module.exports = ContestRouter