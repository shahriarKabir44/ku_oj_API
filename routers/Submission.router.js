const SubmissionRouter = require('express').Router()
const JudgeRepository = require('../repositories/Judge.repository')
const SubmissionRepository = require('../repositories/Submission.repository')
const { rejudgeAllSubmissionOfContest } = require('../repositories/contest_rejudge/RejudgeAllSubmissionOfContest')
const { upload } = require('../utils/fileManager')

SubmissionRouter.post('/submit', (req, res) => {
    SubmissionRepository.createSubmission(JSON.parse(req.headers.additionals), req)
        .then(response => {
            res.send({ ...response })
        })
        .catch(response => {
            res.send({ error: response })
        })
})

SubmissionRouter.post('/getPreviousSubmissionsOfProblem', (req, res) => {
    SubmissionRepository.getPreviousSubmissionsOfProblem(req.body)
        .then(previousSubmissions => {
            res.send({ previousSubmissions })
        })
})



SubmissionRouter.post('/getSubmissionInfo', (req, res) => {
    SubmissionRepository.getSubmissionInfo(req.body)
        .then(submissionInfo => {
            res.send(submissionInfo)
        })

})

SubmissionRouter.get('/getContestSubmissions/:contestId/:pageNumber', (req, res) => {
    SubmissionRepository.getContestSubmissions(req.params)
        .then(submissions => {
            res.send(submissions)
        })
})

SubmissionRouter.get('/getUserSubmissions/:userId/:pageNumber', (req, res) => {
    SubmissionRepository.getUserSubmissions(req.params)
        .then(submissions => {
            res.send(submissions)
        })
})

SubmissionRouter.get('/rejudgeContestSubmissions/:contestId', (req, res) => {
    rejudgeAllSubmissionOfContest(req.params)
        .then(data => {
            res.send({ data: 1 })

        })
})
module.exports = SubmissionRouter