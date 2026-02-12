const ContestRepository = require('../repositories/Contest.repository');
const { ContestResult } = require('../repositories/ContestResult.class')
const JudgeRepository = require('../repositories/Judge.repository')
const { executeSqlAsync } = require('../utils/executeSqlAsync')
const { validateJWT, jwtValidator } = require('../utils/validateJWT')

const ContestContributorRouter = require('express').Router();

ContestContributorRouter.post('/addContestContributor', validateJWT, (req, res) => {
    ContestRepository.addContestContributor(req.body, req.user)
        .then(() => {
            res.send({
                data: "Contributor added successfully",
                errorMsg: null
            })
        })
        .catch(error => {
            res.send({
                data: null,
                errorMsg: error.message
            })
        })
})





module.exports = {
    ContestContributorRouter
}
