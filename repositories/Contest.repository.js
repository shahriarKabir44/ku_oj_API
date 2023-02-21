const Promisify = require('../utils/promisify')

const QueryBuilder = require('../utils/queryBuilder')


module.exports = class ContestRepository {
    static async createContest() {

    }
    static async createProblem({ contestId, authorId, title, point }) {
        await Promisify({
            sql: QueryBuilder.insertQuery('problem', ['contestId', 'authorId', 'title', 'point']),
            values: [contestId, authorId, title, point]
        })
        let [{ newId }] = await Promisify({
            sql: `select max(id) as newId from problem where 
                authorId=? and contestId=?;`,
            values: [authorId, contestId]
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