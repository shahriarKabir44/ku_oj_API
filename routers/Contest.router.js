const { getFiles } = require('../executors/getFiles')
const ContestRepository = require('../repositories/Contest.repository')
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

ContestRouter.post('/setProblemFilesURL', (req, res) => {
    ContestRepository.setProblemFilesURL(req.body)
        .then(() => {
            res.send({ success: 1 })
        })
})
ContestRouter.get('/getContestProblems/:id', (req, res) => {
    ContestRepository.getContestProblems(req.params)
        .then(contestProblems => {
            res.send({ contestProblems })
        })
})
ContestRouter.get('/getContestInfo/:id', (req, res) => {
    ContestRepository.getContestInfo(req.params)
        .then(contestInfo => {
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
ContestRouter.post('/registerForContest', (req, res) => {
    ContestRepository.registerForContest(req.body)
        .then(() => {
            res.send({ success: true })
        })
})

ContestRouter.post('/isRegistered', (req, res) => {
    ContestRepository.isRegistered(req.body)
        .then(isRegistered => {
            res.send({ isRegistered })
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


module.exports = ContestRouter