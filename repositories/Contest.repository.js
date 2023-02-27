const Promisify = require('../utils/promisify')

const QueryBuilder = require('../utils/queryBuilder')


module.exports = class ContestRepository {
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
}