const { executeSqlAsync } = require("../../utils/executeSqlAsync")
const { rejudgeUserSubmissions } = require("./RejudgeUserSubmissions")



async function rejudgeProblemsSubmissions({ problem, contestId, contestResult }, transaction) {
    let submissions = await executeSqlAsync({
        sql: `select * from submission where submission.problemId=?  and submittedBy=? and submissionFileURL is not null;`,
        values: [problem.id, contestResult.contestantId]
    }, transaction);
    if (!submissions.length) {
        return null
    }
    let groups = groupSubmissionbyContestant(submissions);
    for (const group of groups) {

        contestResult.official_description[problem.id] = [0, 0, 0]
        contestResult.description[problem.id] = [0, 0, 0]

        await rejudgeUserSubmissions({
            submissions: group,
            problem,
            contestId,
            contestantId: group[0].submittedBy,
            contestResult
        }, transaction)
    }
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