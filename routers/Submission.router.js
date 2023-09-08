const SubmissionRouter = require('express').Router()
const JudgeRepository = require('../repositories/Judge.repository')
const SubmissionRepository = require('../repositories/Submission.repository')
const { rejudgeAllSubmissionOfContest } = require('../repositories/contest_rejudge/RejudgeAllSubmissionOfContest')
const { upload } = require('../utils/fileManager')

SubmissionRouter.post('/submit', [(req, res, next) => {
    SubmissionRepository.createSubmission(JSON.parse(req.headers.additionals))
        .then(submissionId => {
            req.headers.submissionid = submissionId
            req.submissionId = submissionId
            next()
        })
}, upload.single('file'), (req, res, next) => {
    req.submissionFileURL = req.fileDir + '/' + req.filename
    next()
}], (req, res) => {
    let data = JSON.parse(req.headers.additionals)
    data.submissionId = req.submissionId
    data.submissionFileURL = req.submissionFileURL
    SubmissionRepository.setSubmissionFileURL({
        id: req.submissionId,
        submissionFileURL: req.submissionFileURL
    })
    let judgeRepository = new JudgeRepository({ ...data, ext: req.headers.ext })
    judgeRepository.judgeSubmission()
        .then(resp => {
            res.send(resp)
        })
    judgeRepository = null
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

SubmissionRouter.get('/rejudgeContestSubmissions/:contestId', (req, res) => {
    rejudgeAllSubmissionOfContest(req.params)
        .then(data => {
            res.send({ data: 1 })

        })
})
module.exports = SubmissionRouter