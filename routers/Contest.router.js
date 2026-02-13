const { getFiles } = require('../executors/getFiles')
const ContestRepository = require('../repositories/Contest.repository')
const { ContestResult } = require('../repositories/ContestResult.class')
const { executeSqlAsync } = require('../utils/executeSqlAsync')
const { jwtValidator } = require('../utils/validateJWT')
const { sendSuccess, sendError } = require('../utils/responseHelper')
const { validate } = require('../utils/validateReqest')
const Joi = require('joi')

const ContestRouter = require('express').Router()

ContestRouter.post('/createContest', validate(Joi.object().unknown(true)), jwtValidator, (req, res) => {
    ContestRepository.createContest(req.body)
        .then(contestId => {
            return sendSuccess(res, { contestId })
        })
        .catch(err => sendError(res, err.message))
})


ContestRouter.get('/getUpcomingContests', (req, res) => {
    ContestRepository.getUpcomingContests(req.body)
        .then(contests => {
            return sendSuccess(res, contests)
        })
        .catch(err => sendError(res, err.message))
})

ContestRouter.get('/getFullContestDetailsForEdit/:contestId', jwtValidator, (req, res) => {
    ContestRepository.getFullContestDetailsForEdit(req.params, req.user)
        .then(fullContestDetails => {
            return sendSuccess(res, fullContestDetails)
        })
        .catch(err => sendError(res, err.message))
})

ContestRouter.get('/getContests', (req, res) => {
    ContestRepository.getContests()
        .then(contests => {
            return sendSuccess(res, contests)
        })
        .catch(err => sendError(res, err.message))
})
ContestRouter.post('/createProblem', validate(Joi.object().unknown(true)), jwtValidator, (req, res) => {
    ContestRepository.createProblem(req.body, req.user)
        .then(problemId => {
            return sendSuccess(res, { problemId })
        })
        .catch(err => sendError(res, err.message))
})


ContestRouter.get('/getContestProblems/:id', validate(Joi.object({ id: Joi.number().required() }), 'params'), (req, res) => {
    ContestRepository.getContestProblems(req.params)
        .then(contestProblems => {
            return sendSuccess(res, { contestProblems })
        })
        .catch(err => sendError(res, err.message))
})
ContestRouter.get('/findContestById/:id', validate(Joi.object({ id: Joi.number().required() }), 'params'), (req, res) => {
    ContestRepository.findContestById(req.params)
        .then(contestInfo => {
            ContestRepository.beginContest(contestInfo)
            return sendSuccess(res, { contestInfo })
        })
        .catch(err => sendError(res, err.message))
})

ContestRouter.get('/getProblemInfo/:id', validate(Joi.object({ id: Joi.number().required() }), 'params'), (req, res) => {
    ContestRepository.getProblemInfo(req.params)
        .then(problemInfo => {
            return sendSuccess(res, { problemInfo })
        })
        .catch(err => sendError(res, err.message))
})

ContestRouter.get('/searchContestByProblem/:problemId', validate(Joi.object({ problemId: Joi.number().required() }), 'params'), (req, res) => {
    ContestRepository.searchContestByProblem(req.params)
        .then(contest => {
            return sendSuccess(res, contest)
        })
        .catch(err => sendError(res, err.message))
})

ContestRouter.get('/getContestResult/:contestantId/:contestId', validate(Joi.object({ contestantId: Joi.number().required(), contestId: Joi.number().required() }), 'params'), (req, res) => {
    ContestResult.find(req.params)
        .then(contestResult => {
            return sendSuccess(res, contestResult)
        })
        .catch(err => sendError(res, err.message))
})

ContestRouter.get('/hasSolvedProblem_/:userId/:problemId', validate(Joi.object({ userId: Joi.number().required(), problemId: Joi.number().required() }), 'params'), (req, res) => {
    ContestRepository.hasSolvedProblem_(req.params)
        .then(verdicts => {
            return sendSuccess(res, verdicts)
        })
        .catch(err => sendError(res, err.message))
})

ContestRouter.post('/getContestStandings', (req, res) => {
    ContestRepository.getContestStandings(req.body)
        .then(standings => {
            return sendSuccess(res, standings)
        })
        .catch(err => sendError(res, err.message))
})


ContestRouter.get('/getProblemFiles/:problemId', jwtValidator, async (req, res) => {
    try {
        let problem = await executeSqlAsync({
            sql: `select * from problem where id=?  `,
            values: [req.params.problemId * 1]
        });
        problem = problem[0];
        if (problem == null) {
            return sendError(res, 'Invalid Request!')
        }
        if (!await ContestRepository.isAllowedToEditContest(problem.contestId, req.user.id)) {
            return sendError(res, 'Access Denied!')
        }
        let testcase = await getFiles(`/testcases/${req.params.problemId}/in.txt`)
        let output = await getFiles(`/testcases/${req.params.problemId}/out.txt`)
        testcase = testcase.toString()
        output = output.toString()
        return sendSuccess(res, { testcase, output })
    } catch (err) {
        return sendError(res, err.message)
    }
})


ContestRouter.post('/updateContestInfo', jwtValidator, (req, res) => {

    ContestRepository.updateContestInfo(req.body, req.user)
        .then(data => {
            return sendSuccess(res, "")
        })
        .catch(err => {
            return sendError(res, err.message)
        })
})

ContestRouter.post('/updateProblemInfo', jwtValidator, (req, res) => {
    ContestRepository.updateProblemInfo(req.body, req.user)
        .then(data => {
            return sendSuccess(res, "")
        })
        .catch(err => {
            return sendError(res, err.message)
        })
})

ContestRouter.get('/getParticipatedContestList/:userId/:pageNumber', validate(Joi.object({ userId: Joi.number().required(), pageNumber: Joi.number().required() }), 'params'), (req, res) => {
    ContestRepository.getParticipatedContestList(req.params)
        .then(participatedContestList => {
            return sendSuccess(res, participatedContestList)
        })
        .catch(err => sendError(res, err.message))
})
ContestRouter.get('/getProblems/:pageNumber', validate(Joi.object({ pageNumber: Joi.number().required() }), 'params'), (req, res) => {
    ContestRepository.getProblems(req.params)
        .then(problems => {
            return sendSuccess(res, problems)
        })
        .catch(err => sendError(res, err.message))
})


ContestRouter.post('/saveMessageToContestThread', jwtValidator, (req, res) => {
    ContestRepository.saveMessageToContestThread(req.body)
        .then(() => {
            return sendSuccess(res, { data: 1 })
        })
        .catch(err => sendError(res, err.message))
})

ContestRouter.get('/getContestMessages/:contestId', validate(Joi.object({ contestId: Joi.number().required() }), 'params'), (req, res) => {
    ContestRepository.getContestMessages(req.params)
        .then(messages => {
            return sendSuccess(res, messages)
        })
        .catch(err => sendError(res, err.message))
})
ContestRouter.get('/setStandings/:contestId', validate(Joi.object({ contestId: Joi.number().required() }), 'params'), (req, res) => {
    ContestRepository.setStandings(req.params.contestId)
        .then(() => {
            return sendSuccess(res, { data: 1 })

        })
        .catch(err => sendError(res, err.message))
})

module.exports = ContestRouter
