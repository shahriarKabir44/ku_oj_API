const SubmissionRouter = require('express').Router()
const JudgeRepository = require('../repositories/Judge.repository')
const SubmissionRepository = require('../repositories/Submission.repository')
const { rejudgeAllSubmissionOfContest } = require('../repositories/contest_rejudge/RejudgeAllSubmissionOfContest')
const { upload } = require('../utils/fileManager')
const { sendSuccess, sendError } = require('../utils/responseHelper')
const { validate } = require('../utils/validateRequest')
const Joi = require('joi')

SubmissionRouter.post('/submit', (req, res) => {
    SubmissionRepository.createSubmission(JSON.parse(req.headers.additionals), req)
        .then(response => {
            return sendSuccess(res, response)
        })
        .catch(response => {
            return sendError(res, response)
        })
})

SubmissionRouter.post('/getPreviousSubmissionsOfProblem', (req, res) => {
    SubmissionRepository.getPreviousSubmissionsOfProblem(req.body)
        .then(previousSubmissions => {
            return sendSuccess(res, { previousSubmissions })
        })
        .catch(err => sendError(res, err))
})


SubmissionRouter.post('/getSubmissionInfo', (req, res) => {
    SubmissionRepository.getSubmissionInfo(req.body)
        .then(submissionInfo => {
            return sendSuccess(res, submissionInfo)
        })
        .catch(err => sendError(res, err))

})

SubmissionRouter.get('/getContestSubmissions/:contestId/:pageNumber', validate(Joi.object({ contestId: Joi.number().required(), pageNumber: Joi.number().required() }), 'params'), (req, res) => {
    SubmissionRepository.getContestSubmissions(req.params)
        .then(submissions => {
            return sendSuccess(res, submissions)
        })
        .catch(err => sendError(res, err))
})

SubmissionRouter.get('/getUserSubmissions/:userId/:pageNumber', validate(Joi.object({ userId: Joi.number().required(), pageNumber: Joi.number().required() }), 'params'), (req, res) => {
    SubmissionRepository.getUserSubmissions(req.params)
        .then(submissions => {
            return sendSuccess(res, submissions)
        })
        .catch(err => sendError(res, err))
})

SubmissionRouter.get('/rejudgeContestSubmissions', (req, res) => {
    console.log(req.query);
    rejudgeAllSubmissionOfContest(req.query)
        .then(data => {
            return sendSuccess(res, { data: 1 })

        })
        .catch(err => sendError(res, err))
})
module.exports = SubmissionRouter
