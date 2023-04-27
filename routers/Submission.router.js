const SubmissionRouter = require('express').Router()
const JudgeRepository = require('../repositories/Judge.repository')
const SubmissionRepository = require('../repositories/Submission.repository')

SubmissionRouter.post('/submit', (req, res) => {
    SubmissionRepository.createSubmission(req.body)
        .then(submissionId => {
            res.send({ submissionId })
        })
})

SubmissionRouter.get('/setSubmissionFileURL/:data', (req, res) => {
    SubmissionRepository.setSubmissionFileURL(JSON.parse(req.params.data))
    JudgeRepository.judgeSubmission(JSON.parse(req.params.data), res)

})
SubmissionRouter.post('/getPreviousSubmissions', (req, res) => {
    SubmissionRepository.getPreviousSubmissions(req.body)
        .then(previousSubmissions => {
            res.send({ previousSubmissions })
        })
})

SubmissionRouter.get('/getSubmissionInfo/:id', (req, res) => {
    SubmissionRepository.getSubmissionInfo(req.params)
        .then(submissionInfo => {
            res.send({ submissionInfo })
        })

})


module.exports = SubmissionRouter