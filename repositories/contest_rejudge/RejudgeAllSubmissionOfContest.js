
const { beginTransaction } = require("../../utils/dbConnection");
const { executeSqlAsync } = require("../../utils/executeSqlAsync");
const QueryBuilder = require("../../utils/queryBuilder");
const { RedisClient } = require("../../utils/RedisClient");

const { ContestResult } = require("../ContestResult.class");
const { rejudgeProblemsSubmissions } = require("./RejudgeProblemsSubmissions");


async function rejudgeAllSubmissionOfContest({ contestId, problemId }) {
    let transaction = await beginTransaction(process.env, "READ COMMITTED");
    try {
        RedisClient.store(`locked_contest${contestId}`, true);
        console.log(contestId);

        let problems = await executeSqlAsync({
            sql: `SELECT * from problem WHERE
                    problem.contestId=? ${problemId * 1 ? 'and id=?' : ''} and isAvailable=1;`,
            values: problemId ? [contestId, problemId] : [contestId]
        }, transaction);
        console.log(problems);
        if (!problems.length) {
            throw new Error("No Problem found to rejudge!");
        }

        let _contestResults = await executeSqlAsync({
            sql: `select * from contestResult where contestId=?`,
            values: [contestId]
        });

        let contestResults = _contestResults.map(contestResult => {
            return ContestResult.extractDataFromDB([contestResult])
        })
        for (let contestResult of contestResults) {
            let promises = []
            contestResult.official_description = {}
            contestResult.description = {}
            contestResult.officialVerdicts = {}
            contestResult.verdicts = {}


            for (let problem of problems) {
                await rejudgeProblemsSubmissions({ problem, contestId, contestResult }, transaction)
            }

            // await Promise.all(promises)

            contestResult.official_points = 0
            for (let problemId in contestResult.official_description) {
                contestResult.official_points += contestResult.official_description[problemId][2]
            }
            contestResult.points = 0
            for (let problemId in contestResult.description) {
                contestResult.points += contestResult.description[problemId][2]
            }
            console.log("here2")
            await contestResult.updateAndStore(transaction)
            console.log("herex")
        }

        await transaction.commit();
        console.log('committed')
        await RedisClient.store(`locked_contest${contestId}`, false);

    } catch (error) {
        await transaction.rollback();
        await RedisClient.store(`locked_contest${contestId}`, false);

    }
    finally {
        await RedisClient.store(`locked_contest${contestId}`, false);

        console.log("end")
        await transaction.destroy();
    }

}

module.exports = { rejudgeAllSubmissionOfContest }