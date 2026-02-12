const ContestRepository = require('../repositories/Contest.repository');
const { ContestResult } = require('../repositories/ContestResult.class')
const JudgeRepository = require('../repositories/Judge.repository')
const { executeSqlAsync } = require('../utils/executeSqlAsync');
const { sendSuccess } = require('../utils/responseHelper');
const { validateJWT, jwtValidator } = require('../utils/validateJWT')

const ContestContributorRouter = require('express').Router();

ContestContributorRouter.post('/addContestContributor', validateJWT, (req, res) => {
    ContestRepository.addContestContributor(req.body, req.user)
        .then(() => {
            sendSuccess(res, null, null)
        })
        .catch(error => {
            sendError(res, error.message)

        })
})





module.exports = {
    ContestContributorRouter
}
