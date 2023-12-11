const { executeSqlAsync } = require("../../utils/executeSqlAsync")
const { rejudgeUserSubmissions } = require("./RejudgeUserSubmissions")



async function rejudgeProblemsSubmissions({ problem, contestId, contestResult }) {
    let submissions = await executeSqlAsync({
        sql: `select * from submission where submission.problemId=?  and submittedBy=?;`,
        values: [problem.id, contestResult.contestantId]
    })
    if (!submissions.length) {
        return null
    }
    let groups = groupSubmissionbyContestant(submissions)
    let promises = []
    groups.forEach(group => {
        contestResult.official_description[problem.id] = [0, 0, 0]
        contestResult.description[problem.id] = [0, 0, 0]

        promises.push(rejudgeUserSubmissions({
            submissions: group,
            problem,
            contestId,
            contestantId: group[0].submittedBy,
            contestResult
        }).then(e => {
        }))

    })
    await Promise.all(promises)
    return contestResult

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


module.exports = { rejudgeProblemsSubmissions }