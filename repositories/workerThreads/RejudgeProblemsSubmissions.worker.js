const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require("worker_threads");
const { executeSqlAsync } = require("../../utils/executeSqlAsync");
const { initConnection } = require("../../utils/dbConnection");
require('dotenv').config()
initConnection(process.env)
if (!isMainThread) {

}

const rejudgeUserSubmissionsWorker = new Worker(__dirname + '/RejudgeUserSubmissions.worker.js')

parentPort.on('message', (message) => {
    getAllProblemSubmissions(message)
})

async function getAllProblemSubmissions({ problemId }) {
    let submissions = await executeSqlAsync({
        sql: `select * from submission where submission.problemId=? 
            order by submittedBy desc;`,
        values: [problemId]
    })
    let [problem] = await executeSqlAsync({
        sql: `select * from problem where id=?;`,
        values: [problemId]
    })
    let groups = groupSubmissionbyContestant(submissions)
    groups.forEach(group => {
        rejudgeUserSubmissionsWorker.postMessage({ submissions: group, problem })
    })

}
/**
 * 
 * @param {[any]} submissions 
 */
function groupSubmissionbyContestant(submissions) {
    let groups = [[]]
    let lastGroup = groups[0]
    submissions.forEach(submission => {
        if (lastGroup.length == 0) lastGroup.push(submission)
        else {
            if (lastGroup[0].submittedBy == submission.submittedBy)
                lastGroup.push(submission)
            else {
                lastGroup = [submission]
                groups.push(lastGroup)
            }
        }

    })
    return groups
}