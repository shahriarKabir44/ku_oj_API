const SubmissionRouter = require('express').Router()
const SubmissionRepository = require('../repositories/Submission.repository')
const { rejudgeAllSubmissionOfContest } = require('../repositories/contest_rejudge/RejudgeAllSubmissionOfContest')
const { sendSuccess, sendError } = require('../utils/responseHelper')
const { validate } = require('../utils/validateReqest')
const Joi = require('joi')

SubmissionRouter.post('/submit', (req, res) => {
    SubmissionRepository.createSubmission(JSON.parse(req.headers.additionals), req)
        .then(response => {
            return sendSuccess(res, response)
        })
        .catch(response => {
            return sendError(req, res, response.message)
        })
})

SubmissionRouter.post('/getPreviousSubmissionsOfProblem', (req, res) => {
    SubmissionRepository.getPreviousSubmissionsOfProblem(req.body)
        .then(previousSubmissions => {
            return sendSuccess(res, previousSubmissions)
        })
        .catch(err => sendError(req, res, err.message))
})


SubmissionRouter.post('/getSubmissionInfo', (req, res) => {
    SubmissionRepository.getSubmissionInfo(req.body)
        .then(submissionInfo => {
            return sendSuccess(res, submissionInfo)
        })
        .catch(err => sendError(req, res, err.message))

})

SubmissionRouter.get('/getContestSubmissions/:contestId/:pageNumber', validate(Joi.object({ contestId: Joi.number().required(), pageNumber: Joi.number().required() }), 'params'), (req, res) => {
    SubmissionRepository.getContestSubmissions(req.params)
        .then(submissions => {
            return sendSuccess(res, submissions)
        })
        .catch(err => sendError(req, res, err.message))
})

SubmissionRouter.get('/getUserSubmissions/:userId/:pageNumber', validate(Joi.object({ userId: Joi.number().required(), pageNumber: Joi.number().required() }), 'params'), (req, res) => {
    SubmissionRepository.getUserSubmissions(req.params)
        .then(submissions => {

            return sendSuccess(res, submissions)
        })
        .catch(err => sendError(req, res, err.message))
})

SubmissionRouter.get('/rejudgeContestSubmissions', (req, res) => {
    rejudgeAllSubmissionOfContest(req.query)
        .then(data => {
            if (data == null) {
                return sendError(req, res, "Error Occured!")
            }
            return sendSuccess(res, { data: 1 })

        })
        .catch(err => sendError(req, res, err.message))
})
module.exports = SubmissionRouter
