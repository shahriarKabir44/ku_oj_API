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
    static async getContestProblems({ id }) {
        return Promisify({
            sql: `SELECT * from problem WHERE
                    problem.contestId=?;`,
            values: [id]
        })
    }
    static async createContest({ title, startTime, endTime, hostId }) {
        await Promisify({
            sql: QueryBuilder.insertQuery('contest', ['title', 'startTime', 'endTime', 'hostId']),
            values: [title, startTime, endTime, hostId]
        })
        let [{ contestId }] = await Promisify({
            sql: `select max(id) as contestId from contest where 
                hostId=?  ;`,
            values: [hostId]
        })
        return contestId
    }
    static async createProblem({ contestId, title, point }) {
        await Promisify({
            sql: QueryBuilder.insertQuery('problem', ['contestId', 'title', 'point']),
            values: [contestId, title, point]
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