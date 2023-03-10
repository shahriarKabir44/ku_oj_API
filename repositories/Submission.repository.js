const Promisify = require('../utils/promisify')
const getFile = require('../executors/getFiles')
module.exports = class SubmissionRepository {
    static async getPreviousSubmissions({ problemId, userId }) {
        return Promisify({
            sql: `SELECT * FROM submission WHERE
                 problemId=?  and submittedBy=?; `,
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
            FROM submission where id=1;`,
            values: [id]
        })

        let file = getFile(submissionInfo.submissionFileURL)
        submissionInfo.code = file
        return submissionInfo

    }
    static async createSubmission({ problemId, submittedBy, time, language }) {
        await Promisify({
            sql: QueryBuilder.insertQuery('submission', ['problemId', 'submittedBy', 'time', 'language']),
            values: [problemId, submittedBy, time, language]
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