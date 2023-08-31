const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require("worker_threads");
const { executeSqlAsync } = require("../../utils/executeSqlAsync");
const { runPython } = require("../../executors/runPython");
const { initConnection } = require("../../utils/dbConnection");
const ContestRepository = require("../Contest.repository");
const { ContestResult } = require("../ContestResult.class");
require('dotenv').config()
initConnection(process.env)


parentPort.on('message', async ({ contestId }) => {
    let problems = await ContestRepository.getContestProblems({ id: contestId })
    let _contestResults = await executeSqlAsync({
        sql: `select * from contestResult where contestId=?`,
        values: [contestId]
    })
    let contestResults = _contestResults.map(contestResult => ContestResult.extractData(contestResult))
    contestResults.forEach(contestResult => {
        let count = 0
        problems.forEach(problem => {
            const worker = new Worker(__dirname + '/RejudgeProblemsSubmissions.worker.js');
            worker.postMessage({ problem, contestId, contestResult })
            worker.on('message', e => {
                count++;
                if (count == problems.length) {
                    contestResult.updateAndStore()
                }
            })
        })
    })

})

