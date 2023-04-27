const SubmissionRouter = require('express').Router()
const JudgeRepository = require('../repositories/Judge.repository')
const SubmissionRepository = require('../repositories/Submission.repository')

SubmissionRouter.post('/submit', (req, res) => {
    SubmissionRepository.createSubmission(req.body)
        .then(submissionId => {
            res.send({ submissionId })
        })
})

SubmissionRouter.post('/setSubmissionFileURL', (req, res) => {
    SubmissionRepository.setSubmissionFileURL(req.body)
    JudgeRepository.judgeSubmission(req.body)
        .then(resp => {
            res.send(resp)
        })

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