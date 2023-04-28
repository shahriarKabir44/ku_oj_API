const SubmissionRouter = require('express').Router()
const JudgeRepository = require('../repositories/Judge.repository')
const SubmissionRepository = require('../repositories/Submission.repository')
const { upload } = require('../utils/fileManager')

SubmissionRouter.post('/submit', [(req, res, next) => {
    console.log(req.headers)
    SubmissionRepository.createSubmission(JSON.parse(req.headers.additionals))
        .then(submissionId => {
            req.submissionId = submissionId
            next()
        })
}, upload.single('file'), (req, res, next) => {
    req.submissionFileURL = req.fileDir + '/' + req.filename
    next()
}], (req, res) => {
    console.log(req.headers.additionals)
    let data = JSON.parse(req.headers.additionals)
    data.submissionId = req.submissionId
    data.submissionFileURL = req.submissionFileURL
    SubmissionRepository.setSubmissionFileURL({ id: req.submissionId, submissionFileURL: req.submissionFileURL })

    JudgeRepository.judgeSubmission(data)
        .then(resp => {
            res.send(resp)
        })
})

SubmissionRouter.post('/getPreviousSubmissionsOfProblem', (req, res) => {
    SubmissionRepository.getPreviousSubmissionsOfProblem(req.body)
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