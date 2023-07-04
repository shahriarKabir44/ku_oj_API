const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require("worker_threads");
const { executeSqlAsync } = require("../../utils/executeSqlAsync");

if (!isMainThread) {

}

const rejudgeUserSubmissionsWorker = new Worker(__dirname + './RejudgeUserSubmissions.worker.js')


async function getAllProblemSubmissions({ problemId }) {
    let submissions = await executeSqlAsync({
        sql: `select * from submissions where submission.problemId=? 
            order by submittedBy desc;`
    })
    let groups = groupSubmissionbyContestant(submissions)
    groups.forEach(group => {
        rejudgeUserSubmissionsWorker.postMessage(group)
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