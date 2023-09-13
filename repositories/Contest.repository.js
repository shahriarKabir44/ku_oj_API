const { RedisClient } = require('../utils/RedisClient')
const { executeSqlAsync } = require('../utils/executeSqlAsync')

const QueryBuilder = require('../utils/queryBuilder')
const { ContestResult } = require('./ContestResult.class')


module.exports = class ContestRepository {
    static async beginContest(contest) {
        if (contest.status == 1 || contest.status == 2) return
        if (contest.startTime >= (new Date()) * 1) return
        let timeSpan = contest.endTime - contest.startTime
        contest.status = 1
        console.log(timeSpan)
        executeSqlAsync({
            sql: `update contest set status=1 where id=?;`,
            values: [contest.id]
        })

        RedisClient.store(`contest_${contest.id}`, contest)
        setTimeout(() => {

            contest.status = 2
            executeSqlAsync({
                sql: `update contest set status=2 where id=?;`,
                values: [contest.id]
            })
            console.log(contest)
            RedisClient.store(`contest_${contest.id}`, contest)
            this.setStandings(contest.id)
        }, timeSpan)
    }
    static async getProblems({ pageNumber }) {
        return executeSqlAsync({
            sql: `select id,title,points,numSolutions,
                (select title from contest where contest.id = problem.contestId) as contestTitle
            from problem order by id desc limit ?,20;`,
            values: [pageNumber * 1]

        })
    }
    static async setStandings(contestId) {
        let contestResults = await executeSqlAsync({
            sql: `select * from contestResult where hasAttemptedOfficially=1 and contestId=? order by official_points desc ;`,
            values: [contestId]
        })
        console.log(contestResults)
        contestResults.forEach((contestResult, index) => {
            contestResult.position = index + 1
            const { contestantId } = contestResult
            executeSqlAsync({
                sql: `update contestResult set position=? where contestId=? and contestantId=?;`,
                values: [index + 1, contestId, contestantId]
            })
            let _contestResult = ContestResult.extractDataFromDB([contestResult])
            _contestResult.storeInRedis()
        });
    }
    static async findContestById({ id }) {

        let _contest = await RedisClient.queryCache(`contest_${id}`)
        if (_contest != null)
            return _contest

        let [contest] = await executeSqlAsync({
            sql: `select * from contest where id=?;`,
            values: [id]
        })
        RedisClient.store(`contest_${id}`, contest)
        return contest
    }
    static async findContestByProblemId(problemId) {
        let _contest = await RedisClient.queryCache(`problem_${problemId}_contest`)
        if (_contest != null) return _contest
        let problem = await this.findProblemById(problemId)
        let contest = await this.findContestById({ id: problem.contestId })
        RedisClient.store(`problem_${problemId}_contest`, contest)
        return contest

    }
    static async saveMessageToContestThread({ contestId, senderId, senderName, message }) {
        return executeSqlAsync({
            sql: QueryBuilder.insertQuery(
                'contestMessage',
                ['contestId', 'senderId', 'senderName', 'message']
            ),
            values: [contestId, senderId, senderName, message]
        })
    }
    static async getContestMessages({ contestId }) {
        return executeSqlAsync({
            sql: `select * from contestMessage where contestId=? oder by time desc;`,
            values: [contestId]
        })
    }
    static async getContests() {
        return executeSqlAsync({
            sql: `SELECT id,startTime,endTime,title,hostId, 
                (select userName from user WHERE user.id=hostId) 
                as hostName from contest order by startTime desc;`,
            values: []
        })
    }

    static async getUpcomingContests() {
        let time = (new Date()) * 1
        return executeSqlAsync({
            sql: `SELECT id,startTime,endTime,title,hostId, 
                (select userName from user WHERE user.id=hostId) 
                as hostName from contest where contest.startTime>=? or (contest.startTime<=? and contest.endTime>=?) order by contest.startTime;`,
            values: [time, time, time]
        })
    }
    static async findProblemById(id) {
        let _problem = await RedisClient.queryCache(`problem_${id}`)
        if (_problem != null) return _problem
        let [problemInfo] = await executeSqlAsync({
            sql: `select * from problem where id=?`,
            values: [id]
        })

        RedisClient.store(`problem_${id}`, problemInfo)
        return problemInfo

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
        try {
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
        } catch (error) {
            return null
        }

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



    static async getContestStandings({ contestId, isOfficial }) {
        return executeSqlAsync({
            sql: `select contestId,contestantId, unofficial_ac_time,official_ac_time, (select userName from user where user.id=contestantId) as contestantName,
                points, description,official_description,official_points,verdicts, officialVerdicts
                from contestResult where contestId=? and ${isOfficial ? 'hasAttemptedOfficially' : 'hasAttemptedUnofficially'}=1 order by ${!isOfficial ? 'points' : 'official_points'} desc  ; `,
            values: [contestId]
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
    static async getParticipatedContestList({ userId, pageNumber }) {
        return executeSqlAsync({
            sql: `select
                    contestId,
                    official_points,
                    position, (
                        select startTime
                        from
                            contest
                        where contest.id= contestId
                    ) as participationTime,
                     (
                        select title
                        from
                            contest
                        where contest.id= contestId
                    ) as contestTitle
                from contestResult
                where
                    hasAttemptedOfficially = 1
                    and contestantId = ?
                order by participationTime  desc
                limit ?, 10;`,
            values: [userId, pageNumber * 1]

        })
    }
    static async hasSolvedProblem_({ userId, problemId }) {

        let contest = await this.findContestByProblemId(problemId)
        let contestResult = await ContestResult.find({
            contestantId: userId,
            contestId: contest.id
        })
        if (contestResult == null) return {}
        return {
            official: contestResult.officialVerdicts[problemId],
            unofficial: contestResult.verdicts[problemId]
        }
    }
}