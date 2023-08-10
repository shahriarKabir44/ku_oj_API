const { executeSqlAsync } = require('../utils/executeSqlAsync')

const QueryBuilder = require('../utils/queryBuilder')


module.exports = class ContestRepository {
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

    static async getProblemInfo({ id }) {
        let [problemInfo] = await executeSqlAsync({
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
    static async getContestInfo({ id }) {
        let [contest] = await executeSqlAsync({
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
        const [contest] = await executeSqlAsync({
            sql: `select * from contest 
                where contest.id=(select contestId from problem where problem.id=?);`,
            values: [problemId]
        })
        return contest
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
            executeSqlAsync({
                sql: `select * from contest where id=?;`,
                values: [contestId]
            }).then(([contestInfo]) => {
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


    static updateContestInfo({ id, title, startTime, endTime, code }) {
        return executeSqlAsync({
            sql: QueryBuilder.createUpdateQuery('contest',
                ['title', 'startTime', 'endTime', 'code']) + `where id=?;`,
            values: [title, startTime, endTime, code, id]
        })
    }
    static async updateProblemInfo({ id, title, code, points }) {
        return executeSqlAsync({
            sql: QueryBuilder.createUpdateQuery('problem',
                ['title', 'code', 'points']) + ` where id=?;`,
            values: [title, code, points, id]
        })
    }
    static async hasSolvedProblem({ userId, problemId }) {
        try {
            let [{ finalVerdict, finalVerdictOfficial }] = await executeSqlAsync({
                sql: `select  finalVerdict, finalVerdictOfficial from submissionResult
                where contestantId=? and problemId=?;`,
                values: [userId, problemId]
            })
            return { finalVerdict, finalVerdictOfficial }
        } catch (error) {
            return { finalVerdict: null, finalVerdictOfficial: null }

        }

    }
}