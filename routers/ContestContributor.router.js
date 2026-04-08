const ContestRepository = require('../repositories/Contest.repository');
const { ContestResult } = require('../repositories/ContestResult.class')
const JudgeRepository = require('../repositories/Judge.repository')
const { executeSqlAsync } = require('../utils/executeSqlAsync');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { jwtValidator } = require('../utils/validateJWT')

const ContestContributorRouter = require('express').Router();

ContestContributorRouter.post('/addContestContributor', jwtValidator, (req, res) => {
    ContestRepository.addContestContributor(req.body, req.user)
        .then(() => {
            sendSuccess(res, null, null)
        })
        .catch(error => {
            sendError(req, res, error.message)

        })
})





module.exports = {
    ContestContributorRouter
}
