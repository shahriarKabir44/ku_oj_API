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
                 contestId, title,points, testcaseFileURL, code,
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
    static async createProblem({ contestId, title, points, code }) {
        await Promisify({
            sql: QueryBuilder.insertQuery('problem', ['contestId', 'title', 'points', 'code']),
            values: [contestId, title, points * 100, code]
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
    static async searchContestByProblem({ problemId }) {
        const [contest] = await Promisify({
            sql: `select * from contest 
                where contest.id=(select contestId from problem where problem.id=?);`,
            values: [problemId]
        })
        return contest
    }
    static async registerForContest({ userId, contestId }) {

        return Promisify({
            sql: QueryBuilder.insertQuery('registration', ['userId', 'contestId']),
            values: [userId, contestId]
        })
    }
    static async isRegistered({ userId, contestId }) {
        let [registration] = await Promisify({
            sql: `select * from registration where userId=? and contestId=?;`,
            values: [userId, contestId]
        })
        return registration != null
    }

    static async getContestStandings({ contestId, pageNumber, isOfficial }) {
        return Promisify({
            sql: `select contestId,contestantId, (select userName from user where user.id=contestantId) as contestantName,
                points, description,official_description,official_points
                from contestResult where contestId=? order by ${!isOfficial ? 'points' : 'official_points'} desc limit ?,20 ; `,
            values: [contestId, pageNumber]
        })
    }
    static async getFullContestDetails({ contestId }) {
        let data = {}
        await Promise.all([
            Promisify({
                sql: `select * from contest where id=?;`,
                values: [contestId]
            }).then(([contestInfo]) => {
                data = { ...data, ...contestInfo }
            }),
            Promisify({
                sql: `select * from problem where contestId=?`,
                values: [contestId]
            }).then(problems => {
                data = { ...data, problems }
            })
        ])
        return data
    }





}