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
    static async getSubmissionInfo({ id }) {
        let [submissionInfo] = await Promisify({
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
                ) as user
            FROM submission where id=?;`,
            values: [id]
        })

        let file = getFile(submissionInfo.submissionFileURL)
        submissionInfo.code = file
        return submissionInfo

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