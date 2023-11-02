
const { executeSqlAsync } = require("../../utils/executeSqlAsync");

const { ContestResult } = require("../ContestResult.class");
const { rejudgeProblemsSubmissions } = require("./RejudgeProblemsSubmissions");


async function rejudgeAllSubmissionOfContest({ contestId }) {
    let problems = await executeSqlAsync({
        sql: `SELECT * from problem WHERE
                    problem.contestId=?;`,
        values: [contestId]
    })
    let _contestResults = await executeSqlAsync({
        sql: `select * from contestResult where contestId=?`,
        values: [contestId]
    })
    let contestResults = _contestResults.map(contestResult => {
        return ContestResult.extractDataFromDB([contestResult])
    })
    let _promises = []
    contestResults.forEach(contestResult => {
        _promises.push((async () => {

            let promises = []

            problems.forEach(problem => {
                promises.push(rejudgeProblemsSubmissions({ problem, contestId, contestResult }))
            })
            await Promise.all(promises)

            contestResult.official_points = 0
            for (let problemId in contestResult.official_description) {
                contestResult.official_points += contestResult.official_description[problemId][2]
            }
            contestResult.points = 0
            for (let problemId in contestResult.description) {
                contestResult.points += contestResult.description[problemId][2]
            }
            contestResult.updateAndStore()
        })())
    })
    return Promise.all(_promises)

}

module.exports = { rejudgeAllSubmissionOfContest }