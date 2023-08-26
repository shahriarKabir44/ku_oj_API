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
require('dotenv').config()
initConnection(process.env)


parentPort.on('message', ({ contestId }) => {
    ContestRepository.getContestProblems({ id: contestId })
        .then((problems) => {

            problems.forEach(problem => {
                const worker = new Worker(__dirname + '/RejudgeProblemsSubmissions.worker.js');
                worker.postMessage({ problem, contestId })
            })
        })
})

