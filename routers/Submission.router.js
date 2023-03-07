const SubmissionRouter = require('express').Router()
const SubmissionRepository = require('../repositories/Submission.repository')

SubmissionRouter.post('/submit', (req, res) => {
    SubmissionRepository.createSubmission(req.body)
        .then(submissionId => {
            res.send({ submissionId })
        })
})

SubmissionRouter.post('/setSubmissionFileURL', (req, res) => {
    SubmissionRepository.setSubmissionFileURL(req.body)
        .then(() => {
            res.send({ success: 1 })
        })
})
SubmissionRouter.post('/getPreviousSubmissions', (req, res) => {
    SubmissionRepository.getPreviousSubmissions(req.body)
        .then(previousSubmissions => {
            res.send({ previousSubmissions })
        })
})


module.exports = SubmissionRouter