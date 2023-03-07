const ContestRepository = require('../repositories/Contest.repository')

const ContestRouter = require('express').Router()

ContestRouter.post('/submit', (req, res) => {
    ContestRepository.createSubmission(req.body)
        .then(submissionId => {
            res.send({ submissionId })
        })
})

ContestRouter.post('/setSubmissionFileURL', (req, res) => {
    ContestRepository.setSubmissionFileURL(req.body)
        .then(() => {
            res.send({ success: 1 })
        })
})
ContestRouter.post('/getPreviousSubmissions', (req, res) => {
    ContestRepository.getPreviousSubmissions(req.body)
        .then(previousSubmissions => {
            res.send({ previousSubmissions })
        })
})
ContestRouter.post('/createContest', (req, res) => {
    ContestRepository.createContest(req.body)
        .then(contestId => {
            res.send({ contestId })
        })
})
ContestRouter.get('/getContests', (req, res) => {
    ContestRepository.getContests()
        .then(contests => {
            res.send({ contests })
        })
})
ContestRouter.post('/createProblem', (req, res) => {
    ContestRepository.createProblem(req.body)
        .then(problemId => {
            res.send({ problemId })
        })
})

ContestRouter.post('/setProblemFilesURL', (req, res) => {
    ContestRepository.setProblemFilesURL(req.body)
        .then(() => {
            res.send({ success: 1 })
        })
})
ContestRouter.get('/getContestProblems/:id', (req, res) => {
    ContestRepository.getContestProblems(req.params)
        .then(contestProblems => {
            res.send({ contestProblems })
        })
})
ContestRouter.get('/getContestInfo/:id', (req, res) => {
    ContestRepository.getContestInfo(req.params)
        .then(contestInfo => {
            res.send({ contestInfo })
        })
})

ContestRouter.get('/getProblemInfo/:id', (req, res) => {
    ContestRepository.getProblemInfo(req.params)
        .then(problemInfo => {
            res.send({ problemInfo })
        })
})

module.exports = ContestRouter