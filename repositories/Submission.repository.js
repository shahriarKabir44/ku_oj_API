const Promisify = require('../utils/promisify')
const getFile = require('../executors/getFiles')
const QueryBuilder = require('../utils/queryBuilder')
module.exports = class SubmissionRepository {
    static async getPreviousSubmissionsOfProblem({ problemId, userId }) {
        return Promisify({
            sql: `SELECT * FROM submission WHERE
                 problemId=?  and submittedBy=? order by time desc; `,
            values: [problemId, userId]
        })
    }
    static async getSubmissionInfo({ contestId, problemId, submissionId, submittedBy, viewer }) {
        let [contest] = await Promisify({
            sql: `select * from contest where id=?;`,
            values: [contestId]
        })

        if (!contest) return {
            success: false,
            type: 1
        }
        let [submission] = await Promisify({
            sql: `SELECT
                id,
                time,
                execTime,
                verdict,
                language,
                submissionFileURL,
                problemId,
                submittedBy, (
                    select problem.title
                    from problem
                    WHERE
                        problem.id = problemId
                ) as problemName, (
                    SELECT user.userName
                    from user
                    where
                        user.id = submittedBy
                ) as contestantName
            FROM submission where id=?;`,
            values: [submissionId]
        })
        submission.contest = contest
        if (submission.submittedBy == viewer || contest.endTime <= (new Date()) * 1 || contest.hostId == viewer) {
            return {
                success: true,
                submission,
                code: getFile(submission.submissionFileURL)
            }
        }
        else {
            if (contest.endTime >= (new Date()) * 1) {
                return {
                    success: false,
                    type: 2
                }
            }
        }

    }
    static async createSubmission({ problemId, submittedBy, time, languageName, contestId }) {
        await Promisify({
            sql: QueryBuilder.insertQuery('submission', ['problemId', 'submittedBy', 'time', 'language', 'contestId']),
            values: [problemId, submittedBy, time, languageName, contestId]
        })
        let [{ submissionId }] = await Promisify({
            sql: `select max(id) as submissionId
                    from submission
                    WHERE
                problemId =? and submittedBy =?; `,
            values: [problemId, submittedBy]
        })
        return submissionId
    }
    static async setSubmissionFileURL({ id, submissionFileURL }) {
        Promisify({
            sql: `update submission set submissionFileURL=?
                where id=?;`,
            values: [submissionFileURL, id]
        })
    }
}