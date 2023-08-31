const { RedisClient } = require('../utils/RedisClient')
const { executeSqlAsync } = require('../utils/executeSqlAsync')

const QueryBuilder = require('../utils/queryBuilder')
const JudgeRepository = require('./Judge.repository')


module.exports = class ContestRepository {
    static async findContestById({ id }) {
        try {

            let contest = await RedisClient.queryCache(`contest_${id}`)
            return contest
        } catch (error) {

            let [contest] = await executeSqlAsync({
                sql: `select * from contest where id=?;`,
                values: [id]
            })
            RedisClient.store(`contest_${id}`, contest)
            return contest
        }
    }
    static async getContests() {
        return executeSqlAsync({
            sql: `SELECT id,startTime,endTime,title,hostId, 
                (select userName from user WHERE user.id=hostId) 
                as hostName from contest;`,
            values: []
        })
    }

    static async getUpcomingContests() {
        let time = (new Date()) * 1
        return executeSqlAsync({
            sql: `SELECT id,startTime,endTime,title,hostId, 
                (select userName from user WHERE user.id=hostId) 
                as hostName from contest where contest.startTime>=?;`,
            values: [time]
        })
    }
    static async findProblemById(id) {
        try {
            return await RedisClient.queryCache(`problem_${id}`)
        } catch (error) {
            let [problemInfo] = await executeSqlAsync({
                sql: `select * from problem where id=?`,
                values: [id]
            })

            RedisClient.store(`problem_${id}`, problemInfo)
            return problemInfo
        }

    }
    static async getProblemInfo({ id }) {
        let problem = await this.findProblemById(id)
        let contest = await this.findContestById({ id: problem.contestId })
        problem.contestName = contest.title
        problem.contestCode = contest.code

        return problem
    }
    static async getContestProblems({ id }) {
        return executeSqlAsync({
            sql: `SELECT * from problem WHERE
                    problem.contestId=?;`,
            values: [id]
        })
    }
    static async createContest({ title, startTime, endTime, hostId, code }) {
        await executeSqlAsync({
            sql: QueryBuilder.insertQuery('contest', ['title', 'startTime', 'endTime', 'hostId', 'code']),
            values: [title, startTime, endTime, hostId, code]
        })
        let [{ contestId }] = await executeSqlAsync({
            sql: `select max(id) as contestId from contest where 
                hostId=?  ;`,
            values: [hostId]
        })
        return contestId
    }
    static async createProblem({ contestId, title, points, code, createdOn }) {
        await executeSqlAsync({
            sql: QueryBuilder.insertQuery('problem', ['contestId', 'title', 'points', 'code', "createdOn"]),
            values: [contestId, title, points * 100, code, createdOn]
        })
        let [{ newId }] = await executeSqlAsync({
            sql: `select max(id) as newId from problem where 
                  contestId=?;`,
            values: [contestId]
        })

        this.setProblemFilesURL({
            problemId: newId,
            outputFileURL: `/testcases/${newId}/out.txt`,
            testcaseFileURL: `/testcases/${newId}/in.txt`,
            statementFileURL: `/${newId}.pdf`
        })

        return newId
    }
    static async setProblemFilesURL({ problemId, outputFileURL, testcaseFileURL, statementFileURL }) {
        return executeSqlAsync({
            sql: `update problem set statementFileURL=?, testcaseFileURL=?, outputFileURL=?
                where id=?;`,
            values: [statementFileURL, testcaseFileURL, outputFileURL, problemId]
        })
    }

    static async searchContestByProblem({ problemId }) {

        const problem = await this.findProblemById(problemId)
        return await this.findContestById({ id: problem.contestId })
    }



    static async getContestStandings({ contestId, pageNumber, isOfficial }) {
        return executeSqlAsync({
            sql: `select contestId,contestantId, (select userName from user where user.id=contestantId) as contestantName,
                points, description,official_description,official_points,verdicts, officialVerdicts
                from contestResult where contestId=? order by ${!isOfficial ? 'points' : 'official_points'} desc limit ?,20 ; `,
            values: [contestId, pageNumber]
        })
    }
    static async getFullContestDetails({ contestId }) {
        let data = {}
        await Promise.all([
            this.findContestById({ id: contestId })
                .then((contestInfo) => {
                    data = { ...data, ...contestInfo }
                }),
            executeSqlAsync({
                sql: `select * from problem where contestId=?`,
                values: [contestId]
            }).then(problems => {
                data = { ...data, problems }
            })
        ])
        return data
    }


    static async updateContestInfo({ id, title, startTime, endTime, code }) {
        await executeSqlAsync({
            sql: QueryBuilder.createUpdateQuery('contest',
                ['title', 'startTime', 'endTime', 'code']) + `where id=?;`,
            values: [title, startTime, endTime, code, id]
        })
        this.findContestById({ id })
            .then(_contest => {
                RedisClient.store(`contest_${id}`, {
                    ..._contest,
                    'title': title,
                    'startTime': startTime,
                    'endTime': endTime,
                    'code': code
                })
            })

    }
    static async updateProblemInfo({ id, title, code, points }) {
        await executeSqlAsync({
            sql: QueryBuilder.createUpdateQuery('problem',
                ['title', 'code', 'points']) + ` where id=?;`,
            values: [title, code, points, id]
        })

        RedisClient.queryCache(`problem_${id}`)
            .then(_problem => {
                RedisClient.store(`problem_${id}`, {
                    ..._problem,
                    'title': title,
                    'points': points,
                    'code': code
                })
            })

    }
    static async hasSolvedProblem({ userId, problemId }) {


        try {
            let { finalVerdict, finalVerdictOfficial } = await JudgeRepository.getSubmissionResult({ problemId, userId })
            return { finalVerdict, finalVerdictOfficial }
        } catch (error) {
            return { finalVerdict: null, finalVerdictOfficial: null }

        }
    }
}