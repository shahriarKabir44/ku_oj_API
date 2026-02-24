
const { beginTransaction } = require("../../utils/dbConnection");
const { executeSqlAsync } = require("../../utils/executeSqlAsync");
const QueryBuilder = require("../../utils/queryBuilder");
const { RedisClient } = require("../../utils/RedisClient");

const { ContestResult } = require("../ContestResult.class");
const { rejudgeProblemsSubmissions } = require("./RejudgeProblemsSubmissions");


async function rejudgeAllSubmissionOfContest({ contestId, problemId }) {
    let transaction = await beginTransaction(process.env, "READ COMMITTED");
    try {

        let problems = await executeSqlAsync({
            sql: `SELECT * from problem WHERE
                    problem.contestId=? ${problemId * 1 ? 'and id=?' : ''} and isAvailable=1;`,
            values: problemId ? [contestId, problemId] : [contestId]
        }, transaction);
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
        RedisClient.store(`locked_contest${contestId}`, true);

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

            await contestResult.updateAndStore(transaction)

        }
        transaction.commit();

        await RedisClient.store(`locked_contest${contestId}`, false);

    } catch (error) {
        await transaction.rollback();
        await RedisClient.store(`locked_contest${contestId}`, false);

    }
    finally {
        await RedisClient.store(`locked_contest${contestId}`, false);

        await transaction.destroy();
    }

}

module.exports = { rejudgeAllSubmissionOfContest }