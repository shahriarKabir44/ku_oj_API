const { executeSqlAsync } = require('../utils/executeSqlAsync')
const { getFiles } = require('../executors/getFiles')
const QueryBuilder = require('../utils/queryBuilder')
const { beginTransaction } = require('../utils/dbConnection')
const fs = require('fs/promises');
const { getUploadedFileName, getUploadFilePath } = require('../utils/fileManager');
const JudgeRepository = require('./Judge.repository');
const path = require('path');
const ContestRepository = require('./Contest.repository');
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
                errorMessage,
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
    static async createSubmission({ problemId, submittedBy, time, languageName, contestId, isOfficial }, httpRequest) {
        let transaction = await beginTransaction(process.env);
        try {
            let problem = await ContestRepository.findProblemById(problemId);
            if (problem == null) {
                throw new Error("Problem Not found/deleted!");
            }
            await executeSqlAsync({
                sql: QueryBuilder.insertQuery('submission', ['problemId', 'submittedBy', 'time', 'language', 'contestId', 'isOfficial']),
                values: [problemId, submittedBy, time, languageName, contestId, isOfficial]
            }, transaction)
            let [{ submissionId }] = await executeSqlAsync({
                sql: `select max(id) as submissionId
                    from submission
                    WHERE
                problemId =? and submittedBy =?; `,
                values: [problemId, submittedBy]
            });


            let [dbPath, relativePath] = getUploadFilePath(httpRequest);
            if (!dbPath) throw new Error("Invalid File Dir!");

            let fileName = getUploadedFileName(httpRequest, submissionId);
            if (!fileName) throw new Error("Invalid File Name!");

            const filePath = path.join(relativePath, fileName);
            let fileContent = httpRequest.body.textContent;


            await fs.writeFile(filePath, fileContent, 'utf8');
            let dbPathFull = path.join(dbPath, fileName)
            let data = JSON.parse(httpRequest.headers.additionals)


            await executeSqlAsync({
                sql: `update submission set submissionFileURL=?
                where id=?;`,
                values: [dbPathFull, submissionId]
            }, transaction)

            let judgeRepository = new JudgeRepository({ ...data, ext: httpRequest.headers.ext, submissionFileURL: dbPathFull, submissionId })
            let judgeOutput = await judgeRepository.judgeSubmission(transaction)
            if (judgeOutput == null) {
                throw new Error("Something went wrong!");
            }
            judgeRepository = null


            transaction.commit();
            return judgeOutput

        } catch (error) {
            transaction.rollback();
            throw error;
        }
        finally {
            transaction.destroy();
        }

    }

    static async getContestSubmissions({ contestId, pageNumber }) {
        return executeSqlAsync({
            sql: `select
                   submission. id,
                    time,
                    verdict,
                    language,
                    execTime,
                    submittedBy,
                   submission. problemId, problem.title as problemName,
                     user.userName as author
                from submission
                inner join problem on  problem.id = submission.problemId
                inner join user on  user.id = submission.submittedBy
                where submission. contestId = ? and problem.isAvailable=1
                order by time desc LIMIT ?,10;`,
            values: [contestId, pageNumber * 1]
        })
    }
    static async getUserSubmissions({ userId, pageNumber }) {
        return executeSqlAsync({
            sql: `select
                     submission.  id,
                   submission.  time,
                    verdict,
                   submission.  language,
                    execTime,
                    submittedBy,
                    submission.   contestId,
                    submission.   problemId,problem.title as problemName,
                  contest. title  as contestTitle
                from submission
                inner join problem on  problem.id = submission.problemId
                inner join contest on  contest.id =submission. contestId

                where submittedBy = ? and problem.isAvailable=1 and isPublished=1
                order by time desc LIMIT ?,10;`,
            values: [userId, pageNumber * 1]
        })
    }
}