const { executeSqlAsync } = require('../utils/executeSqlAsync')
const { getFiles } = require('../executors/getFiles')
const QueryBuilder = require('../utils/queryBuilder')
module.exports = class SubmissionRepository {
    static async getPreviousSubmissionsOfProblem({ problemId, userId }) {
        return executeSqlAsync({
            sql: `SELECT * FROM submission WHERE
                 problemId=?  and submittedBy=? order by time desc; `,
            values: [problemId, userId]
        })
    }
    static async getSubmissionInfo({ contestId, submissionId, viewer }) {
        let [contest] = await executeSqlAsync({
            sql: `select * from contest where id=?;`,
            values: [contestId]
        })


        if (!contest) return {
            success: false,
            type: 1
        }
        let [submission] = await executeSqlAsync({
            sql: `SELECT
                id,
                time,
                execTime,
                verdict,
                language,
                submissionFileURL,
                contestId,
                problemId,
                submittedBy, (
                    select problem.title
                    from problem
                    WHERE
                        problem.id = problemId
                ) as problemName,
                (
                    select problem.code
                    from problem
                    WHERE
                        problem.id = problemId
                ) as problemCode,  (
                    SELECT user.userName
                    from user
                    where
                        user.id = submittedBy
                ) as authorName
            FROM submission where id=?;`,
            values: [submissionId]
        })
        if (!submission) {
            return {
                success: false,
                type: 1
            }
        }
        submission.contest = contest
        if (submission.submittedBy == viewer || contest.endTime <= (new Date()) * 1 || contest.hostId == viewer) {
            return {
                success: true,
                submission,
                code: await getFiles(submission.submissionFileURL)
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
    static async createSubmission({ problemId, submittedBy, time, languageName, contestId, isOfficial }) {
        await executeSqlAsync({
            sql: QueryBuilder.insertQuery('submission', ['problemId', 'submittedBy', 'time', 'language', 'contestId', 'isOfficial']),
            values: [problemId, submittedBy, time, languageName, contestId, isOfficial]
        })
        let [{ submissionId }] = await executeSqlAsync({
            sql: `select max(id) as submissionId
                    from submission
                    WHERE
                problemId =? and submittedBy =?; `,
            values: [problemId, submittedBy]
        })
        return submissionId
    }
    static async setSubmissionFileURL({ id, submissionFileURL }) {
        executeSqlAsync({
            sql: `update submission set submissionFileURL=?
                where id=?;`,
            values: [submissionFileURL, id]
        })
    }
    static async getContestSubmissions({ contestId, pageNumber }) {

        return executeSqlAsync({
            sql: `select
                    id,
                    time,
                    verdict,
                    language,
                    execTime,
                    submittedBy,
                    problemId, (
                        select title
                        from problem
                        where
                            problem.id = submission.problemId
                    ) as problemName,
                    ( select userName
                        from user
                        where
                            user.id = submission.submittedBy
                    ) as author
                from submission
                where contestId = ?
                order by time desc LIMIT ?,20;`,
            values: [contestId, pageNumber * 1]
        })
    }
}