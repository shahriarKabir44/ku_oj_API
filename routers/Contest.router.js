const { getFiles } = require('../executors/getFiles')
const ContestRepository = require('../repositories/Contest.repository')
const { ContestResult } = require('../repositories/ContestResult.class')
const JudgeRepository = require('../repositories/Judge.repository')
const { validateJWT } = require('../utils/validateJWT')

const ContestRouter = require('express').Router()


ContestRouter.post('/createContest', (req, res) => {
    ContestRepository.createContest(req.body)
        .then(contestId => {
            res.send({ contestId })
        })
})


ContestRouter.get('/getUpcomingContests', (req, res) => {
    ContestRepository.getUpcomingContests(req.body)
        .then(contests => {
            res.send(contests)
        })
})

ContestRouter.get('/getFullContestDetails/:contestId', (req, res) => {
    ContestRepository.getFullContestDetails(req.params)
        .then(fullContestDetails => {
            res.send(fullContestDetails)
        })
})

ContestRouter.get('/getContests', (req, res) => {
    ContestRepository.getContests()
        .then(contests => {
            res.send(contests)
        })
})
ContestRouter.post('/createProblem', (req, res) => {
    ContestRepository.createProblem(req.body)
        .then(problemId => {
            res.send({ problemId })
        })
})


ContestRouter.get('/getContestProblems/:id', (req, res) => {
    ContestRepository.getContestProblems(req.params)
        .then(contestProblems => {
            res.send({ contestProblems })
        })
})
ContestRouter.get('/findContestById/:id', (req, res) => {
    ContestRepository.findContestById(req.params)
        .then(contestInfo => {
            ContestRepository.beginContest(contestInfo)
            res.send({ contestInfo })
        })
})

ContestRouter.get('/getProblemInfo/:id', (req, res) => {
    ContestRepository.getProblemInfo(req.params)
        .then(problemInfo => {
            res.send({ problemInfo })
        })
})

ContestRouter.get('/searchContestByProblem/:problemId', (req, res) => {
    ContestRepository.searchContestByProblem(req.params)
        .then(contest => {
            res.send(contest)
        })
})

ContestRouter.get('/getContestResult/:contestantId/:contestId', (req, res) => {
    ContestResult.find(req.params)
        .then(contestResult => {
            res.send(contestResult)
        })
})

ContestRouter.get('/hasSolvedProblem_/:userId/:problemId', (req, res) => {
    ContestRepository.hasSolvedProblem_(req.params)
        .then(verdicts => {
            res.send(verdicts)
        })
})

ContestRouter.post('/getContestStandings', (req, res) => {
    ContestRepository.getContestStandings(req.body)
        .then(standings => {
            res.send(standings)
        })
})


ContestRouter.get('/getProblemFiles/:problemId', async (req, res) => {
    let testcase = await getFiles(`/testcases/${req.params.problemId}/in.txt`)
    let output = await getFiles(`/testcases/${req.params.problemId}/out.txt`)
    testcase = testcase.toString()
    output = output.toString()
    res.send({ testcase, output })
})


ContestRouter.post('/updateContestInfo', (req, res) => {
    ContestRepository.updateContestInfo(req.body)
})

ContestRouter.post('/updateProblemInfo', (req, res) => {
    ContestRepository.updateProblemInfo(req.body)
        .then(() => {
            res.send({ success: 1 })
        })
})

ContestRouter.get('/getParticipatedContestList/:userId/:pageNumber', (req, res) => {
    ContestRepository.getParticipatedContestList(req.params)
        .then(participatedContestList => {
            res.send(participatedContestList)
        })
})
ContestRouter.get('/getProblems/:pageNumber', (req, res) => {
    ContestRepository.getProblems(req.params)
        .then(problems => {
            res.send(problems)
        })
})


ContestRouter.post('/saveMessageToContestThread', (req, res) => {
    ContestRepository.saveMessageToContestThread(req.body)
        .then(() => {
            res.send({ data: 1 })
        })
})

ContestRouter.get('/getContestMessages/:contestId', (req, res) => {
    ContestRepository.getContestMessages(req.params)
        .then(messages => {
            res.send(messages)
        })
})
ContestRouter.get('/setStandings/:contestId', (req, res) => {
    ContestRepository.setStandings(req.params.contestId)
        .then(() => {
            res.send({ data: 1 })

        })
})

module.exports = ContestRouter