
const { executeSqlAsync } = require("../../utils/executeSqlAsync");
const ContestRepository = require("../Contest.repository");
const { ContestResult } = require("../ContestResult.class");
const { rejudgeProblemsSubmissions } = require("./RejudgeProblemsSubmissions");


async function rejudgeAllSubmissionOfContest({ contestId }) {
    RedisClient.init()
    let problems = await ContestRepository.getContestProblems({ id: contestId })
    let _contestResults = await executeSqlAsync({
        sql: `select * from contestResult where contestId=?`,
        values: [contestId]
    })
    let contestResults = _contestResults.map(({ contestId, contestantId }) => new ContestResult({
        _contestId: contestId,
        _contestantId: contestantId
    }))
    let promises = []
    contestResults.forEach(contestResult => {
        problems.forEach(problem => {
            promises.push(rejudgeProblemsSubmissions({ problem, contestId, contestResult }))
        })
    })
    return Promise.all(promises)

}

module.exports = { rejudgeAllSubmissionOfContest }