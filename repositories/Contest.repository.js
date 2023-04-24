const Promisify = require('../utils/promisify')

const QueryBuilder = require('../utils/queryBuilder')


module.exports = class ContestRepository {
    static async getContests() {
        return Promisify({
            sql: `SELECT id,startTime,endTime,title,hostId, 
                (select userName from user WHERE user.id=hostId) 
                as hostName from contest;`,
            values: []
        })
    }

    static async getUpcomingContests() {
        let time = (new Date()) * 1
        return Promisify({
            sql: `SELECT id,startTime,endTime,title,hostId, 
                (select userName from user WHERE user.id=hostId) 
                as hostName from contest where contest.startTime>=?;`,
            values: [time]
        })
    }

    static async getProblemInfo({ id }) {
        let [problemInfo] = await Promisify({
            sql: `select id,statementFileURL,
                 contestId, title,point, testcaseFileURL, code,
                 outputFileURL, numSolutions, (select title from contest
                    where contest.id=problem.contestId) as contestName 
                    , (select code from contest
                    where contest.id=problem.contestId) as contestCode from problem where id=?`,
            values: [id]
        })
        return problemInfo
    }
    static async getContestProblems({ id }) {
        return Promisify({
            sql: `SELECT * from problem WHERE
                    problem.contestId=?;`,
            values: [id]
        })
    }
    static async createContest({ title, startTime, endTime, hostId, code }) {
        await Promisify({
            sql: QueryBuilder.insertQuery('contest', ['title', 'startTime', 'endTime', 'hostId', 'code']),
            values: [title, startTime, endTime, hostId, code]
        })
        let [{ contestId }] = await Promisify({
            sql: `select max(id) as contestId from contest where 
                hostId=?  ;`,
            values: [hostId]
        })
        return contestId
    }
    static async createProblem({ contestId, title, point, code }) {
        await Promisify({
            sql: QueryBuilder.insertQuery('problem', ['contestId', 'title', 'point', 'code']),
            values: [contestId, title, point, code]
        })
        let [{ newId }] = await Promisify({
            sql: `select max(id) as newId from problem where 
                  contestId=?;`,
            values: [contestId]
        })
        return newId
    }
    static async setProblemFilesURL({ problemId, outputFileURL, testcaseFileURL, statementFileURL }) {
        return Promisify({
            sql: `update problem set statementFileURL=?, testcaseFileURL=?, outputFileURL=?
                where id=?;`,
            values: [statementFileURL, testcaseFileURL, outputFileURL, problemId]
        })
    }
    static async getContestInfo({ id }) {
        let [contest] = await Promisify({
            sql: `SELECT
                    id,
                    startTime,
                    endTime,
                    title,
                    code,
                    hostId, (
                        select userName
                        from user
                        WHERE
                            user.id = hostId
                    ) as hostName
                from contest WHERE id=?;`,
            values: [id]
        })
        return contest
    }

}